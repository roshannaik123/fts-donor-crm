import React, { useRef, useState } from "react";

import numWords from "num-words";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Loader2, Download, Calendar, Eye } from "lucide-react";
import Logo1 from "../../assets/receipt/fts_log.png";
import Logo2 from "../../assets/receipt/top.png";
import Logo3 from "../../assets/receipt/ekal.png";
import tallyImg from "../../assets/tally.svg";
import axios from "axios";
import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export const ReceiptViewDialog = ({ id }) => {
  const tableRef = useRef(null);

  const [open, setOpen] = useState(false);
  const token = Cookies.get("token");

  const [isSavingPDF, setIsSavingPDF] = useState(false);
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);

  const {
    data: receiptData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["receiptView", id],
    queryFn: async () => {
      const { data } = await axios.get(
        `${BASE_URL}/api/fetch-donor-receipt-view?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });
  const signature = `${receiptData?.image_url?.image_url}${receiptData?.auth_sign?.[0]?.indicomp_image_sign}`;
  const imgepdf = `${receiptData?.image_url?.image_url}${receiptData?.auth_sign?.[0]?.indicomp_image_sign}`;

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (isOpen) {
      refetch();
    }
  };

  const receipts = receiptData?.data || {};
  const chapter = receiptData?.data?.chapter || {};
  const authsign = receiptData?.auth_sign || [];
  const country = receiptData?.country || [];
  const amountInWords = numWords(receipts.receipt_total_amount || 0);

  const handleSavePDF = async () => {
    const input = tableRef.current;
    if (!input) return;

    setIsSavingPDF(true);
    const originalStyle = input.style.cssText;

    input.style.width = "210mm";
    input.style.minWidth = "210mm";
    input.style.margin = "2mm";
    input.style.padding = "2mm";
    input.style.boxSizing = "border-box";
    input.style.position = "absolute";
    input.style.left = "0";
    input.style.top = "0";

    const clone = input.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.visibility = "visible";
    const pdfSignature = clone.querySelector('img[alt="Authorized Signature"]');

    if (pdfSignature) {
      pdfSignature.src = imgepdf;

      await new Promise((resolve) => {
        pdfSignature.onload = resolve;
        pdfSignature.onerror = resolve;
      });
    }
    document.body.appendChild(clone);

    html2canvas(clone, {
      scale: 2,
      width: 210 * 3.78,
      windowWidth: 210 * 3.78,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 0,
      useCORS: true,
      logging: false,
      backgroundColor: "#FFFFFF",
    })
      .then((canvas) => {
        document.body.removeChild(clone);
        input.style.cssText = originalStyle;

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 2;
        const imgWidth = pdfWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const fileName = `Receipt_${receipts.receipt_ref_no}.pdf`;
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
        pdf.save(fileName);
        const followUpFormData = new FormData();
        followUpFormData.append("chapter_id", receipts.chapter_id);
        followUpFormData.append("indicomp_fts_id", receipts.indicomp_fts_id);
        followUpFormData.append("followup_heading", "PDF Downloaded");
        followUpFormData.append(
          "followup_description",
          `Receipt PDF was downloaded by ${Cookies.get("name")}`,
        );
        followUpFormData.append("followup_status", "Completed");
      })
      .catch((error) => {
        console.error("Error generating PDF: ", error);
        document.body.removeChild(clone);
        input.style.cssText = originalStyle;
      })
      .finally(() => {
        setIsSavingPDF(false);
      });
  };

  const handlReceiptPdf = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: `Receipt_${receipts.receipt_ref_no}`,
    pageStyle: `
        @page {
          size: auto;
          margin: 2mm;
        }
        @media print {
          body {
            border: 0px solid #000;
            margin: 2mm;
            padding: 2mm;
            min-height: 100vh;
          }
          .print-hide {
            display: none;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `,
    onBeforeGetContent: () => setIsPrintingReceipt(true),
    onAfterPrint: () => setIsPrintingReceipt(false),
  });

  const tallyReceipt = receipts?.tally_status;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="View"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
      </DialogTrigger>

      <DialogContent
        className="bg-gradient-to-br from-gray-100 to-amber-50 
                         max-w-[60vw] max-h-[95vh] 
                         overflow-y-auto scrollbar-custom 
                         p-0"
      >
        {isLoading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-900 border-t-amber-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium text-lg">
                Loading Receipt Details
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 md:px-8 pb-8 py-4 mx-auto max-h-full overflow-y-auto">
            <div className="">
              {/* Header */}
              <div className=" mx-auto mb-2">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                        Receipt #{receipts.receipt_ref_no}
                      </h1>
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {moment(receipts.receipt_date).format("MMMM Do, YYYY")}
                        <Badge
                          variant="outline"
                          className="ml-2 border-amber-200 text-amber-700 bg-amber-50"
                        >
                          {receipts.receipt_donation_type}
                        </Badge>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {tallyReceipt == "True" && (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                        <img
                          src={tallyImg}
                          alt="Tally"
                          className="w-4 h-4 mr-1"
                        />
                        Tally Verified
                      </Badge>
                    )}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        className={`gap-2 rounded-full bg-yellow-900 text-white hover:bg-blue-500 `}
                        onClick={handleSavePDF}
                        disabled={isSavingPDF}
                      >
                        {isSavingPDF ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Download
                      </Button>

                      <Button
                        variant="outline"
                        className={`gap-2 rounded-full  bg-blue-500 hover:bg-yellow-500 text-white`}
                        onClick={handlReceiptPdf}
                        disabled={isPrintingReceipt}
                      >
                        {isPrintingReceipt ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Printer className="w-4 h-4" />
                        )}
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className=" mx-auto">
                <div className="grid grid-cols-1 ">
                  <div className="lg:col-span-2">
                    <div className="border border-gray-200/50 bg-gradient-to-br from-yellow-200/80 to-yellow-100/80 rounded-2xl shadow-sm overflow-hidden">
                      <div>
                        <div className="relative border border-gray-300 rounded-xl p-2 bg-white shadow-inner">
                          <div ref={tableRef} className="relative">
                            <img
                              src={Logo1}
                              alt="water mark"
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 w-auto h-56"
                            />

                            <div className="flex justify-between items-center border-t border-r border-l border-black">
                              <img
                                src={Logo1}
                                alt="FTS logo"
                                className="m-3 ml-12 w-auto h-16"
                              />
                              <div className="flex-1 text-center mr-24">
                                <img
                                  src={Logo2}
                                  alt="Top banner"
                                  className="mx-auto mb-0 w-80"
                                />
                                <h2 className="text-xl font-bold mt-1">
                                  {chapter.chapter_name}
                                </h2>
                              </div>
                              <img
                                src={Logo3}
                                alt="Ekal logo"
                                className="m-3 mr-12 w-16 h-16"
                              />
                            </div>

                            <div className="text-center border-x border-b border-black p-1 h-14">
                              <p className="text-sm font-semibold mx-auto max-w-[90%]">
                                {`${chapter?.chapter_address || ""}, ${
                                  chapter?.chapter_city || ""
                                } - ${chapter?.chapter_pin || ""}, ${
                                  chapter?.chapter_state || ""
                                } 
                                                         ${
                                                           chapter?.chapter_email
                                                             ? `Email: ${chapter.chapter_email} |`
                                                             : ""
                                                         } 
                                                         ${
                                                           chapter?.chapter_website
                                                             ? `${chapter.chapter_website} |`
                                                             : ""
                                                         } 
                                                         ${
                                                           chapter?.chapter_phone
                                                             ? `Ph: ${chapter.chapter_phone} |`
                                                             : ""
                                                         } 
                                                         ${
                                                           chapter?.chapter_whatsapp
                                                             ? `Mob: ${chapter.chapter_whatsapp}`
                                                             : ""
                                                         }`}
                              </p>
                            </div>

                            <div className="text-center border-x h-7 border-black p-1">
                              <p className="text-[11px] font-medium mx-auto">
                                Head Office: Ekal Bhawan, 123/A, Harish
                                Mukherjee Road, Kolkata-26. Web:
                                www.ftsindia.com Ph: 033 - 2454 4510/11/12/13
                                PAN: AAAAF0290L
                              </p>
                            </div>

                            <table className="w-full border-t border-black border-collapse text-[12px]">
                              <tbody>
                                <tr>
                                  <td className="border-l border-black p-1">
                                    Received with thanks from :
                                  </td>
                                  <td className="border-l border-black p-1">
                                    Receipt No.
                                  </td>
                                  <td className="p-2">:</td>
                                  <td className="border-r border-black p-1">
                                    <span className="font-bold">
                                      {receipts.receipt_ref_no}
                                    </span>
                                  </td>
                                </tr>

                                <tr>
                                  <td
                                    className="border-l border-black"
                                    rowSpan="2"
                                  >
                                    {Object.keys(receipts).length !== 0 && (
                                      <div className="ml-6 font-bold">
                                        <p className="text-sm leading-tight">
                                          {receipts.donor.indicomp_type !==
                                            "Individual" && "M/s"}
                                          {receipts.donor.indicomp_type ===
                                            "Individual" &&
                                            receipts.donor.title}{" "}
                                          {receipts.donor.indicomp_full_name}
                                        </p>

                                        {receipts.donor
                                          .indicomp_off_branch_address &&
                                          (receipts.donor
                                            .indicomp_corr_preffer ===
                                            "Branch Office" ||
                                            receipts.donor
                                              .indicomp_corr_preffer ===
                                              "Office") && (
                                            <div>
                                              <p className="text-sm leading-tight">
                                                {
                                                  receipts.donor
                                                    .indicomp_off_branch_address
                                                }
                                              </p>
                                              <p className="text-sm leading-tight">
                                                {
                                                  receipts.donor
                                                    .indicomp_off_branch_area
                                                }
                                              </p>
                                              <p className="text-sm leading-tight">
                                                {
                                                  receipts.donor
                                                    .indicomp_off_branch_ladmark
                                                }
                                              </p>
                                              <p className="text-sm leading-tight">
                                                {
                                                  receipts.donor
                                                    .indicomp_off_branch_city
                                                }{" "}
                                                -{" "}
                                                {
                                                  receipts.donor
                                                    .indicomp_off_branch_pin_code
                                                }
                                                ,
                                                {
                                                  receipts.donor
                                                    .indicomp_off_branch_state
                                                }
                                              </p>
                                            </div>
                                          )}

                                        {receipts.donor
                                          .indicomp_res_reg_address &&
                                          (receipts.donor
                                            .indicomp_corr_preffer ===
                                            "Registered" ||
                                            receipts.donor
                                              .indicomp_corr_preffer ===
                                              "Residence" ||
                                            receipts.donor
                                              .indicomp_corr_preffer ===
                                              "Digital") && (
                                            <div>
                                              <p className="text-sm leading-tight">
                                                {
                                                  receipts.donor
                                                    .indicomp_res_reg_address
                                                }
                                              </p>
                                              <p className="text-sm leading-tight">
                                                {
                                                  receipts.donor
                                                    .indicomp_res_reg_area
                                                }
                                              </p>
                                              <p className="text-sm leading-tight">
                                                {
                                                  receipts.donor
                                                    .indicomp_res_reg_ladmark
                                                }
                                              </p>
                                              <p className="text-sm leading-tight">
                                                {
                                                  receipts.donor
                                                    .indicomp_res_reg_city
                                                }{" "}
                                                -{" "}
                                                {
                                                  receipts.donor
                                                    .indicomp_res_reg_pin_code
                                                }
                                                ,
                                                {
                                                  receipts.donor
                                                    .indicomp_res_reg_state
                                                }
                                              </p>
                                            </div>
                                          )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border-l border-t border-black p-1">
                                    Date
                                  </td>
                                  <td className="p-1 border-t border-black">
                                    :
                                  </td>
                                  <td className="border-r border-t border-black p-1">
                                    <span className="font-bold">
                                      {moment(receipts.receipt_date).format(
                                        "DD-MM-YYYY",
                                      )}
                                    </span>
                                  </td>
                                </tr>

                                <tr>
                                  <td className="border-l border-t border-black p-1">
                                    On account of
                                  </td>
                                  <td className="p-1 border-t border-black">
                                    :
                                  </td>
                                  <td className="border-r border-t border-black p-1">
                                    <span className="font-bold">
                                      {receipts.receipt_donation_type}
                                    </span>
                                  </td>
                                </tr>

                                <tr>
                                  <td className="border-l border-black p-1">
                                    <div className="flex items-center">
                                      <span>
                                        {country.find(
                                          (coustate) =>
                                            coustate.state_country === "India",
                                        ) && "PAN No :"}
                                      </span>
                                      <span className="font-bold ml-2">
                                        {country.find(
                                          (coustate) =>
                                            coustate.state_country === "India",
                                        ) && receipts.donor.indicomp_pan_no}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="border-l border-t border-black p-1">
                                    Pay Mode
                                  </td>
                                  <td className="p-1 border-t border-black">
                                    :
                                  </td>
                                  <td className="border-r border-t border-black p-1">
                                    <span className="font-bold">
                                      {receipts.receipt_tran_pay_mode}
                                    </span>
                                  </td>
                                </tr>

                                <tr>
                                  <td className="border-l border-t border-b border-black p-1">
                                    Amount in words :
                                    <span className="font-bold capitalize">
                                      {" "}
                                      {amountInWords} Only
                                    </span>
                                  </td>
                                  <td className="border-l border-b border-t border-black p-1">
                                    Amount
                                  </td>
                                  <td className="p-1 border-b border-t border-black">
                                    :
                                  </td>
                                  <td className="border-r border-b border-t border-black p-1">
                                    Rs.{" "}
                                    <span className="font-bold">
                                      {receipts.receipt_total_amount}
                                    </span>{" "}
                                    /-
                                  </td>
                                </tr>

                                <tr>
                                  <td
                                    className="border-l border-b border-r border-black p-1"
                                    colSpan="4"
                                  >
                                    Reference :
                                    <span className="font-bold text-sm">
                                      {receipts.receipt_tran_pay_details}
                                    </span>
                                  </td>
                                </tr>

                                <tr>
                                  <td
                                    className="border-l border-b border-black p-1"
                                    colSpan="1"
                                  >
                                    {receipts.receipt_exemption_type ===
                                      "80G" && (
                                      <div className="text-[12px]">
                                        {receipts.receipt_date >
                                        "2021-05-27" ? (
                                          <>
                                            Donation is exempt U/Sec.80G of the
                                            <br />
                                            Income Tax Act 1961 vide Order No.
                                            AAAAF0290LF20214 Dt. 28-05-2021.
                                          </>
                                        ) : (
                                          <>
                                            This donation is eligible for
                                            deduction U/S 80(G) of the
                                            <br />
                                            Income Tax Act 1961 vide order
                                            NO:DIT(E)/3260/8E/73/89-90 Dt.
                                            13-12-2011.
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td
                                    className="border-b border-r border-black p-1 text-right text-[12px]"
                                    colSpan="3"
                                  >
                                    For Friends of Tribals Society
                                    <br />
                                    <br />
                                    <br />
                                    {receiptData?.auth_sign?.[0]
                                      ?.indicomp_image_sign && (
                                      <div className="flex justify-end">
                                        <img
                                          src={signature}
                                          alt="Authorized Signature"
                                          className="absolute right-12 bottom-7 h-16"
                                        />
                                      </div>
                                    )}
                                    {authsign.length > 0 && (
                                      <div className="signature-section">
                                        <div className="flex flex-col items-end">
                                          {authsign.map((sig, key) => (
                                            <div
                                              key={key}
                                              className="text-center"
                                            >
                                              {sig.signature_image && (
                                                <img
                                                  src={sig.signature_image}
                                                  alt={`${sig.indicomp_full_name}'s signature`}
                                                  className="h-12 mb-1"
                                                />
                                              )}
                                              <span className="font-semibold">
                                                {sig.indicomp_full_name}
                                              </span>
                                              {chapter.auth_sign ? (
                                                <div className="text-sm text-gray-600">
                                                  {chapter.auth_sign}
                                                </div>
                                              ) : (
                                                <div className="text-sm text-gray-500">
                                                  Authorized Signatory
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

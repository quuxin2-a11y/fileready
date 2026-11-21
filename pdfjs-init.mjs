import * as pdfjs from "./pdf.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = "pdf.worker.min.mjs";
window.pdfjsLib = pdfjs;
window.dispatchEvent(new Event("pdfjs-ready"));

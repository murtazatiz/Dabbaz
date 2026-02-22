const fs = require('fs');
const PDFParser = require("pdf2json");

function extract(filename, outname) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1);
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            fs.writeFileSync(outname, pdfParser.getRawTextContent());
            resolve();
        });
        pdfParser.loadPDF(filename);
    });
}

async function main() {
    await extract('Dabbaz_PRD_v1.4.pdf', 'prd_1_4.txt');
    await extract('Dabbaz_Cursor_Build_Guide_v1.4.pdf', 'cursor_guide_1_4.txt');
    console.log("Done extracting both files.");
}

main().catch(console.error);

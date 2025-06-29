document.getElementById('file-input').addEventListener('change', handleFiles);

async function handleFiles(e) {
  const files = e.target.files;
  if (files.length === 0) return;

  // Enable convert button
  document.getElementById('convert-btn').disabled = false;
  document.getElementById('convert-btn').onclick = () => convertToPDF(files);
}

async function convertToPDF(files) {
  const { PDFDocument, rgb } = PDFLib;

  // Create a new PDF
  const pdfDoc = await PDFDocument.create();
  
  for (const file of files) {
    // Read image as URL
    const imageUrl = URL.createObjectURL(file);
    const img = await loadImage(imageUrl);

    // Add a page with the image dimensions
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: img.width,
      height: img.height,
    });
  }

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(pdfBlob);

  // Display download link
  const output = document.getElementById('pdf-output');
  output.innerHTML = `<a href="${pdfUrl}" download="converted.pdf">Download PDF</a>`;
}

// Helper: Load image and get dimensions
function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = url;
  });
}
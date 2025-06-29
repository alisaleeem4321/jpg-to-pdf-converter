// Get DOM elements
const fileInput = document.getElementById('file-input');
const convertBtn = document.getElementById('convert-btn');
const dropArea = document.getElementById('drop-area');
const outputDiv = document.getElementById('pdf-output');

// ===== 1. DRAG AND DROP SETUP =====
// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area on drag
['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

// ===== 2. FILE HANDLING =====
fileInput.addEventListener('change', handleFiles);

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  dropArea.style.borderColor = '#666';
}

function unhighlight() {
  dropArea.style.borderColor = '#ccc';
}

function handleDrop(e) {
  const files = e.dataTransfer.files;
  fileInput.files = files;
  handleFiles({ target: fileInput });
}

// ===== 3. CONVERSION LOGIC =====
async function handleFiles(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  // Enable convert button
  convertBtn.disabled = false;
  convertBtn.textContent = `Convert ${files.length} file(s) to PDF`;
  outputDiv.innerHTML = '';
  
  convertBtn.onclick = () => convertToPDF(files);
}

async function convertToPDF(files) {
  try {
    convertBtn.disabled = true;
    convertBtn.textContent = 'Converting...';
    
    const { PDFDocument } = window.PDFLib;
    const pdfDoc = await PDFDocument.create();
    
    // Embed each image
    for (const file of files) {
      const imageBytes = await file.arrayBuffer();
      let image;
      
      // Try JPG first, then PNG
      try {
        image = await pdfDoc.embedJpg(imageBytes);
      } catch {
        image = await pdfDoc.embedPng(imageBytes);
      }
      
      // Add page with image dimensions
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }
    
    // Generate and download PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    outputDiv.innerHTML = `
      <a href="${url}" download="converted.pdf" class="download-btn">
        Download PDF
      </a>
      <p>✅ ${files.length} image(s) converted!</p>
    `;
    
  } catch (error) {
    outputDiv.innerHTML = `<p class="error">❌ Error: ${error.message}</p>`;
    console.error("Conversion error:", error);
  } finally {
    convertBtn.textContent = 'Convert to PDF';
    convertBtn.disabled = false;
  }
}
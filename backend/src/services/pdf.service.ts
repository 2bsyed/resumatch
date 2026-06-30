import puppeteer from 'puppeteer';

export async function generateCvPdf(cvJson: any): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Generate clean print-friendly HTML for the CV
    const html = generateCvHtml(cvJson);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: { 
        top: '20mm', 
        bottom: '20mm', 
        left: '15mm', 
        right: '15mm' 
      },
      printBackground: false
    });
    
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export function generateCvHtml(cvJson: any): string {
  const personal = cvJson.personal || {};
  const experience = cvJson.experience || [];
  const education = cvJson.education || [];
  const skills = cvJson.skills || {};

  let html = `<!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 10.5pt; color: #000; margin: 0; line-height: 1.45; }
    .header { text-align: center; margin-bottom: 14px; }
    h1 { font-size: 18pt; margin: 0 0 4px 0; font-weight: bold; }
    .contact { font-size: 9.5pt; color: #333; margin-bottom: 12px; }
    h2 { font-size: 11pt; border-bottom: 1px solid #000; padding-bottom: 2px; margin-top: 16px; margin-bottom: 8px; text-transform: uppercase; font-weight: bold; }
    .section { margin-bottom: 14px; }
    .job { margin-bottom: 12px; }
    .job-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 10.5pt; }
    .job-title-row { display: flex; justify-content: space-between; font-style: italic; font-size: 10pt; margin-top: 2px; margin-bottom: 4px; }
    ul { margin: 4px 0; padding-left: 20px; }
    li { margin-bottom: 3px; }
    .edu-item { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .skills-row { margin-bottom: 4px; font-size: 10pt; }
    .bold { font-weight: bold; }
  </style>
  </head>
  <body>
    <div class="header">
      <h1>${personal.full_name || 'Resume'}</h1>
      <div class="contact">
        ${[personal.email, personal.phone, personal.location].filter(Boolean).join(' | ')}
      </div>
    </div>
  `;

  if (personal.summary) {
    html += `
    <div class="section">
      <h2>Professional Summary</h2>
      <p style="margin: 4px 0;">${personal.summary}</p>
    </div>
    `;
  }

  if (experience.length > 0) {
    html += `
    <div class="section">
      <h2>Work Experience</h2>
    `;
    experience.forEach((job: any) => {
      html += `
      <div class="job">
        <div class="job-header">
          <span>${job.company || 'Company'}</span>
          <span>${job.dates || job.duration || ''}</span>
        </div>
        <div class="job-title-row">
          <span>${job.title || 'Role'}</span>
        </div>
      `;
      if (Array.isArray(job.bullets) && job.bullets.length > 0) {
        html += `<ul>`;
        job.bullets.forEach((bullet: string) => {
          html += `<li>${bullet}</li>`;
        });
        html += `</ul>`;
      }
      html += `</div>`;
    });
    html += `</div>`;
  }

  // Skills
  const technical = Array.isArray(skills.technical) ? skills.technical : [];
  const soft = Array.isArray(skills.soft) ? skills.soft : [];
  const tools = Array.isArray(skills.tools) ? skills.tools : [];
  const languages = Array.isArray(skills.languages) ? skills.languages : [];

  if (technical.length > 0 || soft.length > 0 || tools.length > 0 || languages.length > 0) {
    html += `
    <div class="section">
      <h2>Skills & Competencies</h2>
    `;
    if (technical.length > 0) {
      html += `<div class="skills-row"><span class="bold">Technical Skills:</span> ${technical.join(', ')}</div>`;
    }
    if (soft.length > 0) {
      html += `<div class="skills-row"><span class="bold">Soft Skills:</span> ${soft.join(', ')}</div>`;
    }
    if (tools.length > 0) {
      html += `<div class="skills-row"><span class="bold">Tools & Technologies:</span> ${tools.join(', ')}</div>`;
    }
    if (languages.length > 0) {
      html += `<div class="skills-row"><span class="bold">Languages:</span> ${languages.join(', ')}</div>`;
    }
    html += `</div>`;
  }

  // Education
  if (education.length > 0) {
    html += `
    <div class="section">
      <h2>Education</h2>
    `;
    education.forEach((edu: any) => {
      html += `
      <div class="edu-item">
        <div>
          <span class="bold">${edu.degree || 'Degree'}</span>${edu.field ? ` in ${edu.field}` : ''}
          <div style="font-size: 9.5pt; color: #444; margin-top: 1px;">${edu.institution || ''}</div>
        </div>
        <div style="font-size: 9.5pt;">${edu.graduation_date || edu.dates || ''}</div>
      </div>
      `;
    });
    html += `</div>`;
  }

  html += `
  </body>
  </html>`;
  return html;
}

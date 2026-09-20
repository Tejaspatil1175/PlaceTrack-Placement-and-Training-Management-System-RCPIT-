/**
 * RCPIT PlaceTrack Email Templates
 * Branded HTML and plaintext templates for placement notifications
 */

const baseEmailWrapper = (content, headerTitle = 'PlaceTrack — RCPIT Training & Placement Cell') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f6f9;
      color: #1e293b;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }
    .email-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: #ffffff;
      padding: 24px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .email-header p {
      margin: 4px 0 0;
      font-size: 13px;
      opacity: 0.9;
    }
    .email-body {
      padding: 30px;
      line-height: 1.6;
      font-size: 15px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      margin: 15px 0;
    }
    .badge-success {
      background-color: #dcfce7;
      color: #15803d;
    }
    .badge-info {
      background-color: #dbeafe;
      color: #1d4ed8;
    }
    .badge-neutral {
      background-color: #f1f5f9;
      color: #475569;
    }
    .details-box {
      background-color: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin: 20px 0;
      border-radius: 0 6px 6px 0;
    }
    .details-box table {
      width: 100%;
      border-collapse: collapse;
    }
    .details-box td {
      padding: 6px 0;
      font-size: 14px;
    }
    .details-box td.label {
      color: #64748b;
      width: 35%;
      font-weight: 500;
    }
    .details-box td.value {
      color: #0f172a;
      font-weight: 600;
    }
    .email-footer {
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${headerTitle}</h1>
      <p>R. C. Patel Institute of Technology, Shirpur</p>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      <p>This is an automated notification from PlaceTrack T&P Portal, RCPIT.</p>
      <p>&copy; ${new Date().getFullYear()} Training & Placement Cell, RCPIT Shirpur. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * 1. Selection Email Template
 */
const getSelectionEmailTemplate = ({ studentName = 'Student', companyName, role, ctc, notes }) => {
  const subject = `🎉 Congratulations! You have been Selected by ${companyName}`;
  const html = baseEmailWrapper(`
    <p>Dear <strong>${studentName}</strong>,</p>
    <div style="text-align: center;">
      <span class="status-badge badge-success">Application Status: Selected</span>
    </div>
    <p>We are thrilled to inform you that you have been successfully <strong>selected</strong> for the placement opportunity with <strong>${companyName}</strong>!</p>
    
    <div class="details-box">
      <table>
        <tr>
          <td class="label">Company:</td>
          <td class="value">${companyName}</td>
        </tr>
        <tr>
          <td class="label">Role / Profile:</td>
          <td class="value">${role || 'Graduate Engineer Trainee'}</td>
        </tr>
        ${ctc ? `<tr><td class="label">Package (CTC):</td><td class="value">${ctc} LPA</td></tr>` : ''}
        ${notes ? `<tr><td class="label">Notes / Remarks:</td><td class="value">${notes}</td></tr>` : ''}
      </table>
    </div>

    <p>Please log in to the PlaceTrack portal for further joining instructions, documentation requirements, and next steps.</p>
    <p>The entire T&P department and RCPIT faculty congratulate you on this milestone achievement!</p>
    
    <p style="margin-top: 25px;">Best regards,<br><strong>Training & Placement Cell</strong><br>RCPIT, Shirpur</p>
  `, 'Selection Announcement');

  const text = `
Dear ${studentName},

Congratulations! You have been selected for the placement drive at ${companyName} for the role of ${role || 'N/A'}${ctc ? ` with CTC ${ctc} LPA` : ''}.

${notes ? `Remarks: ${notes}\n` : ''}
Please check your PlaceTrack student portal for more details.

Best regards,
Training & Placement Cell, RCPIT Shirpur
  `.trim();

  return { subject, html, text };
};

/**
 * 2. Rejection / Status Update Email Template
 */
const getRejectionEmailTemplate = ({ studentName = 'Student', companyName, role, notes }) => {
  const subject = `Update regarding your application for ${companyName}`;
  const html = baseEmailWrapper(`
    <p>Dear <strong>${studentName}</strong>,</p>
    <p>Thank you for participating in the campus recruitment drive for <strong>${companyName}</strong> (${role || 'Placement Drive'}).</p>
    
    <div class="details-box" style="border-left-color: #64748b;">
      <table>
        <tr>
          <td class="label">Company:</td>
          <td class="value">${companyName}</td>
        </tr>
        <tr>
          <td class="label">Role:</td>
          <td class="value">${role || 'N/A'}</td>
        </tr>
        <tr>
          <td class="label">Status:</td>
          <td class="value">Not Selected in current round</td>
        </tr>
        ${notes ? `<tr><td class="label">Feedback / Remarks:</td><td class="value">${notes}</td></tr>` : ''}
      </table>
    </div>

    <p>While you were not selected in this drive, recruitment processes are highly competitive. We encourage you to keep learning, continue preparing, and apply for upcoming campus drives on PlaceTrack.</p>
    
    <p style="margin-top: 25px;">Best wishes for upcoming drives,<br><strong>Training & Placement Cell</strong><br>RCPIT, Shirpur</p>
  `, 'Application Status Update');

  const text = `
Dear ${studentName},

Thank you for participating in the campus recruitment drive for ${companyName} (${role || 'Placement Drive'}).
We regret to inform you that your application was not selected for further rounds.

${notes ? `Feedback: ${notes}\n` : ''}
Please keep preparing and apply for upcoming drives on PlaceTrack.

Best regards,
Training & Placement Cell, RCPIT Shirpur
  `.trim();

  return { subject, html, text };
};

/**
 * 3. Shortlist Email Template
 */
const getShortlistEmailTemplate = ({ studentName = 'Student', companyName, role, notes }) => {
  const subject = `📋 Shortlisted: Next round for ${companyName}`;
  const html = baseEmailWrapper(`
    <p>Dear <strong>${studentName}</strong>,</p>
    <div style="text-align: center;">
      <span class="status-badge badge-info">Status: Shortlisted</span>
    </div>
    <p>Congratulations! You have been <strong>shortlisted</strong> for the next round of the recruitment process with <strong>${companyName}</strong>.</p>
    
    <div class="details-box">
      <table>
        <tr>
          <td class="label">Company:</td>
          <td class="value">${companyName}</td>
        </tr>
        <tr>
          <td class="label">Role:</td>
          <td class="value">${role || 'N/A'}</td>
        </tr>
        ${notes ? `<tr><td class="label">Next Round Instructions:</td><td class="value">${notes}</td></tr>` : ''}
      </table>
    </div>

    <p>Please be prepared on time and adhere to the dress code and guidelines as communicated by the TPO coordinators.</p>
    
    <p style="margin-top: 25px;">Best regards,<br><strong>Training & Placement Cell</strong><br>RCPIT, Shirpur</p>
  `, 'Shortlist Notification');

  const text = `
Dear ${studentName},

You have been shortlisted for the next evaluation round at ${companyName} (${role || 'Placement Drive'}).

${notes ? `Instructions: ${notes}\n` : ''}
Please log in to PlaceTrack to check details and schedule.

Best regards,
Training & Placement Cell, RCPIT Shirpur
  `.trim();

  return { subject, html, text };
};

/**
 * 4. Generic Notice / Announcement Template
 */
const getGenericNoticeTemplate = ({ title, message, studentName = 'Student', date = new Date().toLocaleDateString() }) => {
  const subject = `📢 T&P Notice: ${title}`;
  const html = baseEmailWrapper(`
    <p>Dear <strong>${studentName}</strong>,</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; margin: 15px 0;">
      <h3 style="margin-top: 0; color: #1e3a8a;">${title}</h3>
      <div style="white-space: pre-line; color: #334155;">${message}</div>
      <div style="margin-top: 15px; font-size: 12px; color: #94a3b8;">Published on: ${date}</div>
    </div>

    <p>For inquiries, please reach out to your departmental TPO coordinator or visit the T&P office.</p>
    
    <p style="margin-top: 25px;">Best regards,<br><strong>Training & Placement Cell</strong><br>RCPIT, Shirpur</p>
  `, 'T&P Announcement');

  const text = `
Dear ${studentName},

T&P Notice: ${title}
Date: ${date}

${message}

Best regards,
Training & Placement Cell, RCPIT Shirpur
  `.trim();

  return { subject, html, text };
};

module.exports = {
  getSelectionEmailTemplate,
  getRejectionEmailTemplate,
  getShortlistEmailTemplate,
  getGenericNoticeTemplate
};

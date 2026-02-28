export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const name = formData.get('name');
    const postcode = formData.get('postcode');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const description = formData.get('description');

    // Basic validation
    if (!name || !email || !postcode || !phone || !description) {
      return new Response('All fields are required', { status: 400 });
    }

    // Send email via MailChannels
    const emailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'lparrott91@gmail.com' }], // Testing email - change to client email later
            dkim_domain: 'dg-landscapes.co.uk',
            dkim_selector: 'mailchannels',
          },
        ],
        from: {
          email: 'noreply@dg-landscapes.co.uk', // Replace with your domain
          name: 'DG Landscapes Quote Form',
        },
        subject: `New Quote Request from ${name}`,
        content: [
          {
            type: 'text/plain',
            value: `
New Quote Request

Name: ${name}
Email: ${email}
Phone: ${phone}
Postcode: ${postcode}

Project Description:
${description}
            `.trim(),
          },
          {
            type: 'text/html',
            value: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    h2 { color: #2c5530; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #2c5530; }
  </style>
</head>
<body>
  <div class="container">
    <h2>New Quote Request</h2>
    <div class="field">
      <div class="label">Name:</div>
      <div>${name}</div>
    </div>
    <div class="field">
      <div class="label">Email:</div>
      <div>${email}</div>
    </div>
    <div class="field">
      <div class="label">Phone:</div>
      <div>${phone}</div>
    </div>
    <div class="field">
      <div class="label">Postcode:</div>
      <div>${postcode}</div>
    </div>
    <div class="field">
      <div class="label">Project Description:</div>
      <div>${description}</div>
    </div>
  </div>
</body>
</html>
            `.trim(),
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('MailChannels error:', errorText);
      return new Response('Failed to send email', { status: 500 });
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Quote request submitted successfully!' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing quote request:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

import { ContactSubmissionModel } from "../models/ContactSubmission";
import nodemailer from "nodemailer";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Create email transporter
// You'll need to configure this with your email service
const createTransporter = () => {
  // For Gmail:
  // 1. Enable 2-factor authentication
  // 2. Generate app password
  // 3. Use app password here

  // For development, you can use ethereal.email for testing
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "your-email@gmail.com",
      pass: process.env.SMTP_PASS || "your-app-password",
    },
  });
};

export async function submitContactForm(data: ContactFormData) {
  try {
    // Save to database
    const submission = new ContactSubmissionModel(data);
    await submission.save();

    // Send email notification
    await sendContactEmail(data);

    return {
      success: true,
      message: "Contact form submitted successfully",
      submissionId: submission._id,
    };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw error;
  }
}

async function sendContactEmail(data: ContactFormData) {
  try {
    const transporter = createTransporter();

    // Email to you (admin)
    const mailOptions = {
      from: process.env.SMTP_USER || "noreply@yourwebsite.com",
      to: process.env.ADMIN_EMAIL || "your-email@gmail.com",
      subject: `New Contact Form Submission from ${data.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${
        data.email
      }</a></p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${
              data.message
            }</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Submitted at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Optional: Send confirmation email to user
    const confirmationOptions = {
      from: process.env.SMTP_USER || "noreply@yourwebsite.com",
      to: data.email,
      subject: "Thank you for contacting us!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank You for Your Message!</h2>
          <p>Hi ${data.name},</p>
          <p>Thank you for reaching out. I have received your message and will get back to you within 24 hours.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${data.message}</p>
          </div>
          <p>Best regards,<br>Your Name</p>
        </div>
      `,
    };

    await transporter.sendMail(confirmationOptions);

    console.log("Contact form emails sent successfully");
  } catch (error) {
    console.error("Error sending contact email:", error);
    // Don't throw - we still want to save the submission even if email fails
  }
}

export async function getContactSubmissions(
  limit: number = 10,
  skip: number = 0,
  read?: boolean
) {
  try {
    const filter: any = {};
    if (read !== undefined) {
      filter.read = read;
    }

    const total = await ContactSubmissionModel.countDocuments(filter);
    const submissions = await ContactSubmissionModel.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    return { submissions, total };
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    throw error;
  }
}

export async function markSubmissionAsRead(submissionId: string) {
  try {
    const submission = await ContactSubmissionModel.findByIdAndUpdate(
      submissionId,
      { read: true },
      { new: true }
    );
    return submission;
  } catch (error) {
    console.error("Error marking submission as read:", error);
    throw error;
  }
}

export async function deleteContactSubmission(submissionId: string) {
  try {
    const result = await ContactSubmissionModel.findByIdAndDelete(submissionId);
    return result;
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    throw error;
  }
}

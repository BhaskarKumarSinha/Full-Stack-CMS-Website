import { Request, Response } from "express";
import * as contactService from "../services/contact.service";

export async function submitContactForm(req: Request, res: Response) {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const result = await contactService.submitContactForm({
      name,
      email,
      phone,
      message,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error in submitContactForm controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit contact form",
    });
  }
}

export async function getContactSubmissions(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = parseInt(req.query.skip as string) || 0;
    const read =
      req.query.read !== undefined ? req.query.read === "true" : undefined;

    const result = await contactService.getContactSubmissions(
      limit,
      skip,
      read
    );

    return res.status(200).json({
      success: true,
      submissions: result.submissions,
      total: result.total,
    });
  } catch (error) {
    console.error("Error in getContactSubmissions controller:", error);
    return res.status(500).json({
      success: false,
      submissions: [],
      total: 0,
      message: "Failed to fetch contact submissions",
    });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const submission = await contactService.markSubmissionAsRead(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Error in markAsRead controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark submission as read",
    });
  }
}

export async function deleteContactSubmission(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await contactService.deleteContactSubmission(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteContactSubmission controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete submission",
    });
  }
}

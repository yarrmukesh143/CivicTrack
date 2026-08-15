import { NextResponse } from "next/server";

type ContactRequest = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

const allowedSubjects = [
  "issue",
  "technical",
  "feedback",
  "other",
];

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as ContactRequest;

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const subject = body.subject;
    const message = body.message?.trim();

    /* ---------------------------------------------
       Validation
    --------------------------------------------- */

    if (!name) {
      return NextResponse.json(
        {
          message: "Name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          message:
            "Name must be at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          message:
            "Name cannot exceed 100 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /* Email */

    if (!email) {
      return NextResponse.json(
        {
          message: "Email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          message:
            "Please provide a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    /* Subject */

    if (
      !subject ||
      !allowedSubjects.includes(subject)
    ) {
      return NextResponse.json(
        {
          message: "Please select a valid subject.",
        },
        {
          status: 400,
        }
      );
    }

    /* Message */

    if (!message) {
      return NextResponse.json(
        {
          message: "Message is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        {
          message:
            "Message must be at least 10 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        {
          message:
            "Message cannot exceed 2000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /* ---------------------------------------------
       TODO:
       Save to database / send email here
    --------------------------------------------- */

    console.log("New CivicTrack contact:", {
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thanks! Your message has been sent successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "CONTACT_API_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong. Please try again later.",
      },
      {
        status: 500,
      }
    );
  }
}
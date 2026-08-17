"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";

export default function ReportPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("road");

  const [image, setImage] = useState<File | null>(null);

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // -----------------------------------------
  // GET CURRENT LOCATION
  // -----------------------------------------

  const getLocation = () => {
    setMessage("");
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(
          position.coords.latitude
        );

        setLongitude(
          position.coords.longitude
        );

        setLocationLoading(false);

        setMessage(
          "Location detected successfully 📍"
        );
      },

      (locationError) => {
        console.error(
          "Location error:",
          locationError
        );

        setLocationLoading(false);

        setError(
          "Unable to get your location. Please allow location access."
        );
      }
    );
  };

  // -----------------------------------------
  // IMAGE SELECT
  // -----------------------------------------

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0] || null;

    setImage(file);

    setError("");
    setMessage("");
  };

  // -----------------------------------------
  // SUBMIT ISSUE
  // -----------------------------------------

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // ---------------------------------------
    // CHECK LOGIN TOKEN
    // ---------------------------------------

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Please login before reporting an issue."
      );

      return;
    }

    // ---------------------------------------
    // CHECK LOCATION
    // ---------------------------------------

    if (
      latitude === null ||
      longitude === null
    ) {
      setError(
        "Please select your current location first."
      );

      return;
    }

    // ---------------------------------------
    // CHECK API URL
    // ---------------------------------------

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL;

    if (!apiBaseUrl) {
      setError(
        "API URL is not configured."
      );

      console.error(
        "NEXT_PUBLIC_API_URL is missing."
      );

      return;
    }

    setLoading(true);

    try {
      // -------------------------------------
      // CREATE FORMDATA
      // -------------------------------------

      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "category",
        category
      );

      formData.append(
        "location",
        JSON.stringify({
          type: "Point",
          coordinates: [
            longitude,
            latitude,
          ],
        })
      );

      if (image) {
        formData.append(
          "image",
          image
        );
      }

      // -------------------------------------
      // API ENDPOINT
      //
      // .env.local:
      // NEXT_PUBLIC_API_URL=
      // https://civictrack-sac1.onrender.com/api
      //
      // Final URL:
      // https://civictrack-sac1.onrender.com/api/issues
      // -------------------------------------

      const endpoint =
        `${apiBaseUrl}/issues`;

      console.log(
        "================================"
      );

      console.log(
        "CREATE ISSUE URL:",
        endpoint
      );

      console.log(
        "CREATE ISSUE METHOD:",
        "POST"
      );

      console.log(
        "CREATE ISSUE CATEGORY:",
        category
      );

      console.log(
        "CREATE ISSUE LOCATION:",
        {
          latitude,
          longitude,
        }
      );

      console.log(
        "================================"
      );

      // -------------------------------------
      // SEND REQUEST
      // -------------------------------------

      const response =
        await fetch(endpoint, {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        });

      // -------------------------------------
      // READ RESPONSE ONLY ONCE
      // -------------------------------------

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const responseText =
        await response.text();

      console.log(
        "CREATE ISSUE STATUS:",
        response.status
      );

      console.log(
        "CREATE ISSUE CONTENT-TYPE:",
        contentType
      );

      console.log(
        "CREATE ISSUE RESPONSE:",
        responseText
      );

      // -------------------------------------
      // PARSE JSON SAFELY
      // -------------------------------------

      let data: any = null;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        try {
          data =
            JSON.parse(
              responseText
            );
        } catch (parseError) {
          console.error(
            "JSON PARSE ERROR:",
            parseError
          );

          throw new Error(
            "Backend returned invalid JSON."
          );
        }
      } else {
        console.error(
          "BACKEND RETURNED NON-JSON:",
          responseText
        );

        throw new Error(
          `Backend returned non-JSON response (${response.status}).`
        );
      }

      // -------------------------------------
      // HANDLE HTTP ERROR
      // -------------------------------------

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to create issue (${response.status})`
        );
      }

      // -------------------------------------
      // SUCCESS
      // -------------------------------------

      console.log(
        "ISSUE CREATED SUCCESSFULLY:",
        data
      );

      setMessage(
        "Issue reported successfully! 🎉"
      );

      // -------------------------------------
      // RESET FORM
      // -------------------------------------

      setTitle("");
      setDescription("");
      setCategory("road");

      setImage(null);

      setLatitude(null);
      setLongitude(null);

      // Reset file input
      const fileInput =
        document.getElementById(
          "image"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      // -------------------------------------
      // REDIRECT
      // -------------------------------------

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      console.error(
        "CREATE ISSUE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the issue."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <main className="min-h-screen bg-[#071312] text-white">
      {/* HEADER */}

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="text-xl font-bold"
          >
            Civic
            <span className="text-[#48cec3]">
              Track
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm text-white/60 transition hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-[#48cec3]">
            CivicTrack
          </p>

          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Report an Issue
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
            Help improve your neighborhood by
            reporting a civic issue.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl sm:p-8"
        >
          {/* SUCCESS */}

          {message && (
            <div className="mb-6 rounded-xl border border-[#48cec3]/20 bg-[#48cec3]/10 px-4 py-3 text-sm text-[#8de8df]">
              {message}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* TITLE */}

          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Issue title
            </label>

            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="e.g. Large pothole near main road"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/20 focus:border-[#48cec3]/60"
            />
          </div>

          {/* DESCRIPTION */}

          <div className="mt-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Description
            </label>

            <textarea
              id="description"
              required
              rows={5}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Describe the issue clearly..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/20 focus:border-[#48cec3]/60"
            />
          </div>

          {/* CATEGORY */}

          <div className="mt-6">
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-[#0b1b19] px-4 py-3.5 text-sm outline-none focus:border-[#48cec3]/60"
            >
              <option value="road">
                Road
              </option>

              <option value="garbage">
                Garbage
              </option>

              <option value="water">
                Water
              </option>

              <option value="electricity">
                Electricity
              </option>

              <option value="street light">
                Street Light
              </option>

              <option value="drainage">
                Drainage
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>

          {/* LOCATION */}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-white/70">
              Location
            </label>

            <button
              type="button"
              onClick={getLocation}
              disabled={
                locationLoading
              }
              className="w-full rounded-xl border border-dashed border-white/15 bg-black/10 px-4 py-4 text-left text-sm text-white/60 transition hover:border-[#48cec3]/50 hover:text-white disabled:opacity-50"
            >
              {locationLoading
                ? "Detecting location..."
                : latitude !== null
                  ? "📍 Location detected"
                  : "📍 Use my current location"}
            </button>

            {latitude !== null &&
              longitude !== null && (
                <p className="mt-2 text-xs text-white/30">
                  {latitude.toFixed(6)}
                  ,{" "}
                  {longitude.toFixed(6)}
                </p>
              )}
          </div>

          {/* IMAGE */}

          <div className="mt-6">
            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Add photo
            </label>

            <label
              htmlFor="image"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/10 px-5 py-8 text-center transition hover:border-[#48cec3]/50"
            >
              <span className="text-3xl">
                📸
              </span>

              <span className="mt-3 text-sm text-white/60">
                {image
                  ? image.name
                  : "Click to upload an image"}
              </span>

              <span className="mt-1 text-xs text-white/30">
                PNG, JPG or JPEG
              </span>

              <input
                id="image"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />
            </label>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-[#159b91] px-5 py-4 font-semibold transition hover:bg-[#18afa4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Submitting report..."
              : "Submit Report →"}
          </button>

          <p className="mt-4 text-center text-xs text-white/30">
            Your report helps make the
            community better.
          </p>
        </form>
      </section>
    </main>
  );
}
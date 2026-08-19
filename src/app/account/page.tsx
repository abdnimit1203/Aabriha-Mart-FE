"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { updateMyProfile, resendVerificationEmail, signOutUser } from "@/lib/auth";
import { uploadAvatar } from "@/lib/upload";
import { ChevronIcon } from "@/components/icons";
import { BD_DIVISIONS, districtsForDivision } from "@/data/bd-locations";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading, getIdToken, refreshProfile, needsProfileCompletion } = useAuth();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  // Tracks which profile the form fields were last synced from, so a
  // freshly (re)loaded profile can reset the form during render — the
  // React-endorsed alternative to setState-in-an-effect for this case.
  const [loadedProfileId, setLoadedProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (profile && profile._id !== loadedProfileId) {
    setLoadedProfileId(profile._id);
    setUsername(profile.username);
    setPhone(profile.phone);
    setDivision(profile.defaultAddress?.division ?? "");
    setDistrict(profile.defaultAddress?.district ?? "");
    setArea(profile.defaultAddress?.area ?? "");
    setDetailedAddress(profile.defaultAddress?.detailedAddress ?? "");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const idToken = await getIdToken();
    if (!idToken) return;

    setSaving(true);
    try {
      const defaultAddress =
        division && district && area && detailedAddress ? { division, district, area, detailedAddress } : undefined;
      await updateMyProfile(idToken, { username, phone, defaultAddress });
      await refreshProfile();
      toast.success("Profile updated.");
    } catch {
      toast.error("Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    const idToken = await getIdToken();
    if (!idToken) return;

    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(file, idToken);
      await updateMyProfile(idToken, { profileImage: url });
      await refreshProfile();
      toast.success("Profile photo updated.");
    } catch {
      toast.error("Couldn't upload that image. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleResendVerification() {
    await resendVerificationEmail();
    toast.success("Verification email sent.");
  }

  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

  if (loading || !profile) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <div className="h-6 w-40 animate-pulse rounded bg-surface" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-surface" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-14">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Account</h1>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
        >
          Sign out
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-medium text-primary-strong">
              {profile.username.charAt(0).toUpperCase()}
            </span>
          )}
          {uploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
              Uploading…
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-background disabled:opacity-50"
          >
            Change photo
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <p className="mt-1 text-xs text-muted-foreground">JPG or PNG, up to 5MB.</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm">
          {profile.email}{" "}
          {profile.emailVerified ? (
            <span className="text-success">✓ verified</span>
          ) : (
            <span className="text-danger">not verified</span>
          )}
        </p>
        {!profile.emailVerified && (
          <button
            type="button"
            onClick={handleResendVerification}
            className="mt-2 text-sm font-medium text-primary-strong hover:underline"
          >
            Resend verification email
          </button>
        )}
      </div>

      {needsProfileCompletion && (
        <p className="mt-4 rounded-2xl border border-primary bg-primary/10 p-4 text-sm text-primary-strong">
          Please add your phone number below to complete your profile.
        </p>
      )}

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            required
            minLength={3}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            required
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
          />
        </div>

        <fieldset className="space-y-4 border-t border-border pt-4">
          <legend className="mb-1 text-sm font-semibold">Default address</legend>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="division" className="mb-1 block text-sm font-medium">
                Division
              </label>
              <div className="relative">
                <select
                  id="division"
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    setDistrict("");
                  }}
                  className="w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 pr-8 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
                >
                  <option value="">Select division</option>
                  {BD_DIVISIONS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label htmlFor="district" className="mb-1 block text-sm font-medium">
                District
              </label>
              <div className="relative">
                <select
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!division}
                  className="w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 pr-8 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-50"
                >
                  <option value="">Select district</option>
                  {districtsForDivision(division).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="area" className="mb-1 block text-sm font-medium">
              Area
            </label>
            <input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
            />
          </div>

          <div>
            <label htmlFor="detailedAddress" className="mb-1 block text-sm font-medium">
              Detailed address
            </label>
            <textarea
              id="detailedAddress"
              rows={2}
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </main>
  );
}

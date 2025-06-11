import { BorderStyles } from "@/modules/resumes/ui/components/BorderStyleButton";
import useDimensions from "@/hooks/useDimensions";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { THUMBNAIL_FALLBACK } from "@/constants";
import { ResumeServerData } from "../../../../types/globals";

interface ResumePreviewProps {
  resumeData: ResumeServerData;
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export default function ResumePreview({
  resumeData,
  contentRef,
  className,
}: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { width } = useDimensions(containerRef);

  return (
    <div
      className={cn(
        "aspect-[210/297] h-fit w-full bg-white text-black",
        className,
      )}
      ref={containerRef}
    >
      <div
        className={cn("space-y-6 p-6", !width && "invisible")}
        style={{
          zoom: (1 / 794) * width,
        }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        <PersonalInfoHeader resumeData={resumeData} />
        <SummarySection resumeData={resumeData} />
        <WorkExperienceSection resumeData={resumeData} />
        <EducationSection resumeData={resumeData} />
        <SkillsSection resumeData={resumeData} />
      </div>
    </div>
  );
}

interface ResumeSectionProps {
  resumeData: ResumeServerData;
}

function PersonalInfoHeader({ resumeData }: ResumeSectionProps) {
  console.log("resumeData photo", resumeData);
  const {
    photoUrl,
    firstName,
    lastName,
    jobTitle,
    city,
    country,
    phone,
    email,
    colorHex,
    borderStyle,
  } = resumeData;

  const [photoSrc, setPhotoSrc] = useState(photoUrl ?? "");
  console.log("photoSrc", photoSrc, photoUrl, resumeData);
  useEffect(() => {
    if (!photoUrl) {
      setPhotoSrc(THUMBNAIL_FALLBACK);
    } else {
      setPhotoSrc(photoUrl);
    }
  }, [photoUrl]);
  const isPrintMode = typeof window !== "undefined" && window.matchMedia("print").matches;
  return (
    <div className="flex items-center gap-6">
      {photoSrc && (
        isPrintMode ? (
          // During print, use normal img
          <Image
            src={photoSrc}
            width={100}
            height={100}
            alt="Author photo"
            style={{
              aspectRatio: "1/1",
              objectFit: "cover",
              borderRadius:
                borderStyle === BorderStyles.SQUARE
                  ? "0px"
                  : borderStyle === BorderStyles.CIRCLE
                    ? "9999px"
                    : "10%",
            }}
          />
        ) : (
          // Normal view, use optimized Next.js Image
          <Image
            src={photoSrc}
            width={100}
            height={100}
            alt="Author photo"
            unoptimized
            className="aspect-square object-cover"
            style={{
              borderRadius:
                borderStyle === BorderStyles.SQUARE
                  ? "0px"
                  : borderStyle === BorderStyles.CIRCLE
                    ? "9999px"
                    : "10%",
            }}
          />
        )
      )}
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p
            className="text-3xl font-bold"
            style={{
              color: colorHex,
            }}
          >
            {firstName} {lastName}
          </p>
          <p
            className="font-medium"
            style={{
              color: colorHex,
            }}
          >
            {jobTitle}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {city}
          {city && country ? ", " : ""}
          {country}
          {(city || country) && (phone || email) ? " • " : ""}
          {[phone, email].filter(Boolean).join(" • ")}
        </p>
      </div>
    </div>
  );
}

function SummarySection({ resumeData }: ResumeSectionProps) {
  const { summary, colorHex } = resumeData;

  if (!summary) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="break-inside-avoid space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Professional profile
        </p>
        <div className="whitespace-pre-line text-sm">{summary}</div>
      </div>
    </>
  );
}

function WorkExperienceSection({ resumeData }: ResumeSectionProps) {
  const { workExperiences, colorHex } = resumeData;

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );

  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Work experience
        </p>
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{
                color: colorHex,
              }}
            >
              <span>{exp.position}</span>
              {exp.startDate && (
                <span>
                  {formatDate(exp.startDate, "MM/yyyy")} -{" "}
                  {exp.endDate ? formatDate(exp.endDate, "MM/yyyy") : "Present"}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{exp.company}</p>
            <div className="whitespace-pre-line text-xs">{exp.description}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function EducationSection({ resumeData }: ResumeSectionProps) {
  const { educations, colorHex } = resumeData;

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0,
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Education
        </p>
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{
                color: colorHex,
              }}
            >
              <span>{edu.degree}</span>
              {edu.startDate && (
                <span>
                  {edu.startDate &&
                    `${formatDate(edu.startDate, "MM/yyyy")} ${edu.endDate ? `- ${formatDate(edu.endDate, "MM/yyyy")}` : ""}`}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{edu.school}</p>
          </div>
        ))}
      </div>
    </>
  );
}
function SkillsSection({ resumeData }: ResumeSectionProps) {
  const { softSkills, hardSkills, colorHex, borderStyle } = resumeData;

  if (!softSkills?.length && !hardSkills?.length) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="break-inside-avoid space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Skills
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {softSkills?.length && softSkills?.length > 0 && (
            <div>
              <p className="text-lg font-semibold" style={{ color: colorHex }}>
                Soft Skills
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {softSkills?.map((skill, index) => (
                  <Badge
                    key={index}
                    className="rounded-md text-white"
                    style={{
                      backgroundColor: colorHex,
                      borderRadius:
                        borderStyle === BorderStyles.SQUARE
                          ? "0px"
                          : borderStyle === BorderStyles.CIRCLE
                            ? "9999px"
                            : "8px",
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {hardSkills?.length && hardSkills?.length > 0 && (
            <div>
              <p className="text-lg font-semibold" style={{ color: colorHex }}>
                Hard Skills
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {hardSkills?.map((skill, index) => (
                  <Badge
                    key={index}
                    className="rounded-md text-white"
                    style={{
                      backgroundColor: colorHex,
                      borderRadius:
                        borderStyle === BorderStyles.SQUARE
                          ? "0px"
                          : borderStyle === BorderStyles.CIRCLE
                            ? "9999px"
                            : "8px",
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
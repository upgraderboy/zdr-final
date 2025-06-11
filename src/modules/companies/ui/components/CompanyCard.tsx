"use client"
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GetAllCompaniesOutput } from "@/types"
import Image from "next/image"
type CompanyCardProps = {
    company: GetAllCompaniesOutput[number]; // 👈 single company
  };
export function CompanyCard({ company }: CompanyCardProps) {

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-4 flex items-center space-x-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={company.logoUrl || "/placeholder.svg"}
            alt={`${company.companyName} logo`}
            width={64}
            height={64}
            className="rounded-full"
          />
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold">{company.companyName}</h2>
              <Badge variant="secondary" className="mt-1 text-xs">
                {company.sectorName}
              </Badge>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{company.presentation}</p>
          <div className="mt-2 flex flex-wrap items-center text-xs text-gray-500 gap-x-4">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {company.stateName}, {company.countryName}
            </div>
            <div className="flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              {company.phoneNumber}
            </div>
            <div className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {company.email}
            </div>
            <a
              href={company.websiteUrl || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 flex items-center"
            >
              Visit <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
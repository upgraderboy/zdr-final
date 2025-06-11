import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator";
import { GetAllJobsOutput } from "@/types";
import { Badge } from "@/components/ui/badge";


export function JobDetailCard({ job }: { job: GetAllJobsOutput[number] }) {
  return (


    <>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{job?.title}</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{job?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Job Details</h3>
                  <p>
                    <span className="font-medium">Contract Type:</span> {job?.contractType}
                  </p>
                  <p>
                    <span className="font-medium">Experience:</span> {job?.experienceLevel}
                  </p>
                  {/* <p>
                    <span className="font-medium">Annual Salary:</span> {job?.isRemote}
                  </p> */}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Requirements</h3>
                  <p>
                    <span className="font-medium">Gender Preference:</span> {job?.genderPreference}
                  </p>
                  <p>
                    {/* <span className="font-medium">Disability:</span> {job?.disable} */}
                  </p>
                  <p>
                    {/* <span className="font-medium">Age Limit:</span> {job?.ageLimit.join(" - ")} */}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {job?.hardSkills?.map((skill, index) => {
                      if(skill){
                        return (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        )
                      }
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job?.softSkills?.map((skill, index) => {
                      if(skill){
                        return (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        )
                      }
                    })}
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <p className="text-sm text-gray-600">{job?.description}</p>
            </div>
          </CardContent>
        </Card>
        {/* {user && user.role === UserType.USER && (
          <ApplyJobButton id={job.id} />
        )} */}
      </DialogContent>
    </>

  )
}

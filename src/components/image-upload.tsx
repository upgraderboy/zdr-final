"use client"
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}
const ImageUpload = ({ disabled, onChange, onRemove, value }: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;
  const onSuccess = (result) => {
    if (typeof result.info !== "string") {
      onChange(result?.info?.secure_url || "");
    }
  };
  return (
    <div className="">
      <div className="mb-4 flex items-center gap-4">
      {
        value.map((url: string, index: number) => (
          <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-gray-400" key={index}>
            <div className="z-10 absolute top-2 right-2">
              <Button type="button" onClick={() => onRemove(url)} size="icon" variant={"destructive"}>
                <Trash className="w-4 h-4" />
              </Button>
            </div>
            <Image fill className="object-contain" src={url || ''} alt="Image" />
          </div>
        ))
      }
    </div>
    <CldUploadWidget onSuccess={onSuccess} uploadPreset={"uboy-shop"}>
      {
        ({open})=>{
          const onClick = ()=>{
            open();
          }
          return (
            <Button type="button" variant={"outline"} disabled={disabled} onClick={onClick}>
              <ImagePlus className="w-4 h-4 mr-2" /> Upload Image
            </Button>
          )
        }
      }
    </CldUploadWidget>
    </div>
  )
}
export default ImageUpload;
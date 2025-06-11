'use client';

import Image from 'next/image';
import { useFormContext, Controller } from 'react-hook-form';

type ImageUploadProps = {
  name: string;
};

export function ImageUpload({ name }: ImageUploadProps) {
  const { control } = useFormContext();

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="flex flex-col gap-2">

          {value && (
            <div className="relative w-40 h-40 border rounded overflow-hidden">
              <Image
                src={value}
                alt="Uploaded"
                fill
                className="object-fit"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const base64 = await toBase64(file);
              onChange(base64);
            }}
          />

          {error && <p className="text-red-500 text-sm">{error.message}</p>}
        </div>
      )}
    />
  );
}
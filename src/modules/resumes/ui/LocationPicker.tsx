import {
    APIProvider,
    Map as GoogleMap,
    Marker,
} from "@vis.gl/react-google-maps";
import { MapPinnedIcon } from "lucide-react";
import { useCallback, useState, type ComponentProps } from "react";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export type Props = ComponentProps<typeof GoogleMap> & {
    apiKey: string;
    value?: google.maps.LatLngLiteral;
    defaultValue?: google.maps.LatLngLiteral;
    onValueChange?: (value?: google.maps.LatLngLiteral) => void;
    // Added optional props
    defaultCenter?: google.maps.LatLngLiteral;
    disabled?: boolean;
    placeholder?: string;
    theme?: "light" | "dark" | "system";
};

export function LocationPicker({
    apiKey,
    className,
    defaultValue,
    onValueChange,
    value,
    defaultCenter = { lat: 0, lng: 0 }, // Default center point
    disabled = false,
    placeholder = "Select a location",
    theme = "system",
    ...props
}: Props) {
    const isControlled = onValueChange !== undefined;
    const [internalValue, setInternalValue] = useState<
        google.maps.LatLngLiteral | undefined
    >(defaultValue);
    console.log("defaultValue", defaultValue);
    // Detect system dark mode preference
    const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");
    const isDarkMode =
        theme === "dark" || (theme === "system" && systemPrefersDark);

    // Memoize handleChange to prevent unnecessary re-renders
    const handleChange = useCallback(
        (latLng?: google.maps.LatLngLiteral | null) => {
            const newValue = latLng ?? undefined;

            if (!isControlled) {
                setInternalValue(newValue);
            }

            onValueChange?.(newValue);
        },
        [isControlled, onValueChange]
    );

    const actualValue = isControlled ? value : internalValue;

    // Format the display value for the button
    const displayValue = actualValue
        ? `${actualValue.lat.toFixed(4)}, ${actualValue.lng.toFixed(4)}`
        : placeholder;

    return (
        <Dialog>
            <DialogTrigger className="w-full" asChild>
                <Button
                    variant="outline" // Match shadcn input style
                    disabled={disabled}
                    className={cn(
                        "w-full justify-start text-left font-normal", // Match input layout
                        "h-10 px-3 py-2", // Match input sizing
                        "bg-background", // Ensure background matches form inputs
                        !actualValue && "text-muted-foreground" // Muted text when no value
                    )}
                >
                    <span className="truncate">{displayValue}</span>
                    <span className="ml-auto">
                        <MapPinnedIcon />
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pick a location</DialogTitle>
                    <DialogDescription>
                        Double-click to place a marker, then drag it to adjust the location.
                    </DialogDescription>
                </DialogHeader>
                <APIProvider apiKey={apiKey}>
                    <div className="h-[400px] w-full">
                        <GoogleMap
                            gestureHandling="greedy"
                            defaultZoom={props.defaultZoom ?? 8}
                            defaultCenter={actualValue ?? defaultCenter}
                            {...props}
                            className={cn(
                                "h-full w-full rounded-md overflow-hidden border", // Important!
                                className
                            )}
                            disableDoubleClickZoom
                            onDblclick={(ev) => !disabled && handleChange(ev.detail.latLng)}
                            styles={isDarkMode ? darkMapStyle : lightMapStyle}
                        >
                            {actualValue && (
                                <Marker
                                    position={actualValue}
                                    draggable={!disabled}
                                    onDragEnd={(ev) =>
                                        !disabled && handleChange(ev.latLng?.toJSON())
                                    }
                                />
                            )}
                        </GoogleMap>
                    </div>
                </APIProvider>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={disabled}>
                            Close
                        </Button>
                    </DialogClose>
                    {actualValue && (
                        <Button
                            variant="destructive"
                            onClick={() => handleChange(undefined)}
                            disabled={disabled}
                        >
                            Clear Selection
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Shadcn-inspired light theme (based on default Tailwind colors)
const lightMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#f7fafc" }] }, // gray-50
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] }, // white
    { elementType: "labels.text.fill", stylers: [{ color: "#4a5568" }] }, // gray-700
    {
        featureType: "administrative",
        elementType: "geometry",
        stylers: [{ color: "#cbd5e0" }], // gray-300
    },
    {
        featureType: "administrative.country",
        elementType: "labels.text.fill",
        stylers: [{ color: "#718096" }], // gray-600
    },
    {
        featureType: "administrative.land_parcel",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#4a5568" }], // gray-700
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#718096" }], // gray-600
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#e2e8f0" }], // gray-200
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#718096" }], // gray-600
    },
    {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{ color: "#edf2f7" }], // gray-100
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#718096" }], // gray-600
    },
    {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{ color: "#e2e8f0" }], // gray-200
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#cbd5e0" }], // gray-300
    },
    {
        featureType: "road.highway.controlled_access",
        elementType: "geometry",
        stylers: [{ color: "#a0aec0" }], // gray-400
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#bee3f8" }], // blue-200 adjusted for water
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#718096" }], // gray-600
    },
];

// Shadcn-inspired dark theme (based on default Tailwind colors)
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#1a202c" }] }, // gray-900
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a202c" }] }, // gray-900
    { elementType: "labels.text.fill", stylers: [{ color: "#a0aec0" }] }, // gray-400
    {
        featureType: "administrative",
        elementType: "geometry",
        stylers: [{ color: "#4a5568" }], // gray-700
    },
    {
        featureType: "administrative.country",
        elementType: "labels.text.fill",
        stylers: [{ color: "#a0aec0" }], // gray-400
    },
    {
        featureType: "administrative.land_parcel",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#e2e8f0" }], // gray-200
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#a0aec0" }], // gray-400
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#2d3748" }], // gray-800
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#a0aec0" }], // gray-400
    },
    {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{ color: "#2d3748" }], // gray-800
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#a0aec0" }], // gray-400
    },
    {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{ color: "#4a5568" }], // gray-700
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#718096" }], // gray-600
    },
    {
        featureType: "road.highway.controlled_access",
        elementType: "geometry",
        stylers: [{ color: "#a0aec0" }], // gray-400
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#2c5282" }], // blue-800 adjusted for water
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#a0aec0" }], // gray-400
    },
];
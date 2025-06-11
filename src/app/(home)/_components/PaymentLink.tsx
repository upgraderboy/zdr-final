"use client";
import Link from "next/link";

interface PaymentLinkProps{
  href: string;
  paymentLink?: string;
  text: string;
}
const PaymentLink = ({href, paymentLink, text}: PaymentLinkProps) => {
  return ( <Link href={href} className="w-full bg-primary text-white py-2" onClick={()=>{
    if(paymentLink){
      localStorage.setItem("stripePaymentLink", paymentLink);
    }
  }

  }>
    {text}
  </Link> );
}

export default PaymentLink;
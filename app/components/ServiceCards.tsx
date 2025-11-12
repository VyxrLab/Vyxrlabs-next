"use client"; // Required if using Next.js 13+ app directory and this is a client component

import React from "react";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";

const cardData = [
  {
    imgurl: "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s1.jpg",
    heading: "Web design and <em>Development</em>",
    desc: "We craft impactful digital experiences that drive real business outcomes. Combining innovation with reliability, we collaborate closely with our partners to turn ideas into meaningful solutions — building trust at every step.",
    bgColor: "#FAFAFA",
    services: [
      "Web Design",
      "Web Development",
      "Competitor Research",
      "User Research",
      "UI/UX Workflow",
      "Userflow & Engagement",
    ],
    icons: [
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s1-1.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s1-2.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s1-3.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s1-4.png"
    ],
  },
  {
    imgurl: "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s2.jpg",
    heading: "Business <em>Automation</em>",
    desc: "Turning Complexity Into Simplicity. We help you cut through the noise, streamlining processes and automating workflows to make your business smarter and more efficient.",
    bgColor: "#F8F8FF",
    services: [
      "Business Research",
      "Workflow Optimization",
      "Automation Experts",
      "Simplifying Complexity",
      "Process Automation",
      "Chaos to Clarity",
    ],
    icons: [
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s2-1.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s2-2.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s2-3.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s2-4.png",
    ],
  },
  {
    imgurl: "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s3.jpg",
    heading: "Search Engine <em>Optimization</em>",
    desc: "Our SEO optimization services help your business rank higher in search results, attract the right audience, and build lasting online authority.",
    bgColor: "#FDFDFD",
    services: ["Visibility", "Page Speed", "Search Engine", "Crawlabilty", "CTR", "SERP"],
    icons: [
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s3-1.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s3-2.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s3-3.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s3-4.png",
    ],
  },
  {
    imgurl: "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s4.jpg",
    heading: "Conversation <em>Optimization</em>",
    desc: "We help you cut through the noise, streamlining processes and automating workflows to make your business smarter and more efficient.",
    bgColor: "#AFFBFF",
    services: [
      "Trust Signals",
      "Customer Behaviour",
      "Form Optimization",
      "Value Proposition",
      "Analytics",
      "Engagements",
    ],
    icons: [
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s4-1.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s4-2.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s4-3.png",
      "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/images/s4-4.png",
    ],
  },
];

const ServiceCards = () => {
  return (
    <div className="relative z-[10] -mt-[250px] max-w-6xl mx-auto px-4 sm:px-6 pb-16 space-y-16">
      {cardData.map((card, index) => (
        <div
          key={index}
          className="rounded-2xl shadow-lg overflow-hidden"
          style={{ backgroundColor: card.bgColor }}
        >
          {/* Image */}
          <div>
            <img
              src={card.imgurl}
              alt={card.heading.replace(/<[^>]*>/g, "")}
              className="w-full h-52 sm:h-72 md:h-96 object-cover"
            />
          </div>

          {/* Content */}
          <div
            className="-mt-16 sm:-mt-20 md:-mt-20 relative px-4 py-6 sm:px-6 sm:py-10 md:p-12 rounded-t-2xl shadow-lg"
            style={{ backgroundColor: card.bgColor }}
          >
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-bold font-montserrat mb-4"
              dangerouslySetInnerHTML={{ __html: card.heading }}
            />
            <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6">
              {card.desc}
            </p>

            {/* Services */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 sm:mt-10 mb-6">
              {card.services.map((service, i) => (
                <div
                  key={i}
                  className="flex items-start text-sm sm:text-base md:text-xl font-semibold"
                >
                  <FaArrowRight className="mt-1 mr-2 text-xs sm:text-sm md:text-base" />
                  {service}
                </div>
              ))}
            </div>

            {/* Divider line */}
            <hr className="border-t-2 border-black my-6 w-full sm:w-[95%] mx-auto" />

            {/* Footer icons + CTA */}
            <div className="flex flex-wrap items-center justify-start gap-4 mt-5">
              {/* Tech Icons */}
              <div className="flex space-x-0">
                {card.icons.map((icon, i) => (
                  <img
                    key={i}
                    src={icon}
                    alt="tech icon"
                    style={{ marginLeft: i === 0 ? "0px" : "-10px" }}
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 object-contain"
                  />
                ))}
              </div>

              {/* Button */}
              <Link
                href="/Contacts"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold shadow hover:opacity-90 transition text-sm sm:text-base"
              >
                <img
                  src="https://static.wixstatic.com/media/0d9155_f5b7e5cc16534e6f987af648c2dc363f~mv2.png"
                  alt="audit"
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                />
                Get a free audit
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceCards;

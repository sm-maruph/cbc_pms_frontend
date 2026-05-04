import React from "react";

const TestimonialCEO = () => {
  return (
    <section className="min-h-[45vh] flex flex-col justify-center items-center text-center px-6 py-6 bg-primary-gradient">
      <h1 className="text-2xl md:text-2xl  text-center text-heading mb-10">
        MESSAGE FROM
      </h1>

      <h2 className="text-2xl md:text-2xl text-heading mb-8">
        CEO
      </h2>

      <div className="flex flex-col items-center">
        <img
          src="https://kafjvkvzsdkofnzevohc.supabase.co/storage/v1/object/public/gsl/others/ceo.webp" // Replace this with your actual image path
          alt="Zabair Hossain"
          className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-4 border-white shadow-lg"
        />

        <h3 className="text-2xl md:text-2xl font-semibold font-heading text-heading mt-6">
           Zamal U. Ahmed
        </h3>

        <p className="max-w-4xl text-center mt-6 text-body font-sans text-base md:text-lg leading-relaxed">
          "AT GRUPO SOURCING, WE
          BELIEVE IN PARTNERSHIPS BUILT ON TRUST, SUSTAINABILITY, AND SHARED
          SUCCESS. OUR GOAL IS TO DELIVER NOT JUST APPAREL BUT LONG-LASTING
          VALUE TO EVERY PARTNER WE WORK WITH "
        </p>
      </div>
    </section>
  );
};

export default TestimonialCEO;

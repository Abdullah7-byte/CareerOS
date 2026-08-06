import FeatureCard from "./FeatureCard";

export default function Features() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-4xl font-bold">Why CareerOS?</h2>

        <p className="mt-4 text-center text-slate-400">
          Everything you need to manage your career in one place.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Resume Builder"
            description="Create ATS-optimized resumes in minutes."
          />

          <FeatureCard
            title="ATS Score"
            description="Analyze your resume against ATS standards."
          />

          <FeatureCard
            title="Job Matching"
            description="Find jobs tailored to your profile."
          />

          <FeatureCard
            title="Application Tracker"
            description="Track every application from one dashboard."
          />
        </div>
      </div>
    </section>
  );
}
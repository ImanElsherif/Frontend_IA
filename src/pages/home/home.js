import "./home.css";

export const Home = () => {
  return (
    
    <div className="home-container">
    {/* Header */}
    <header className="header">
     
    </header>

    {/* Hero Section */}
    <section className="hero">
      <h2 className="hero-heading">Find Your Dream Job</h2>
      <p className="hero-description">
        Start your journey towards a fulfilling career today.
      </p>
    </section>

    {/* Image Section */}
    <img
      src="https://i2.wp.com/hr-gazette.com/wp-content/uploads/2021/12/job-g90b90e472_1280.jpg?fit=1280%2C856&ssl=1"
      alt="Job Seeker Image"
      className="image-section"
    />
  </div>
  );
};

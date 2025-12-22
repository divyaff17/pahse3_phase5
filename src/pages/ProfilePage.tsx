// src/pages/ProfilePage.tsx
import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container-custom py-20">
        <div className="card-glass p-8 rounded-2xl">
          <h1 className="text-3xl font-bold mb-4">Profile</h1>
          <p className="text-muted-foreground">This is a placeholder profile page.</p>
          <div className="mt-6">
            <p>If you removed profile intentionally, you can remove its route from App.tsx later.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;

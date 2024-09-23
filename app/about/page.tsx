
export default function About() {
  return (
    <>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">About SecureGuard</h1>
        <p className="mb-4">
          SecureGuard is a real-time facial recognition and object detection suite designed to enhance security and attendance tracking. Developed as part of the capstone project for the Project Implementation course (PRJ666NBB) at Seneca Polytechnic, SecureGuard leverages advanced algorithms to detect people, animals, weapons, fire hazards, and more.
        </p>
        <p className="mb-4">
          The project focuses on creating a system that reduces reliance on manual surveillance and check-ins. It aims to improve efficiency, reduce errors, and enhance user convenience by automating the identification process.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Team Members</h2>
        <ul className="list-disc pl-5 mb-6">
          <li>Bregwin Paul Jogi</li>
          <li>Gladwin Chan</li>
          <li>Marco Schiralli</li>
          <li>Mohsen Sabet</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4">Instructor</h2>
        <p className="mb-4">Professor: Yasser Elmankabady</p>
        <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
        <p className="mb-4">
          This project focuses on solving the challenges presented by traditional security and attendance systems, which are prone to errors and inefficiencies. By incorporating real-time object detection, SecureGuard provides small businesses, schools, and security-conscious individuals with a more reliable and user-friendly system.
        </p>
      </div>
    </>
  );
}

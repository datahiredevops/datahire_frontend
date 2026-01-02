export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We no longer define a sidebar here. 
  // The global Sidebar component detects if the user is an employer and shows the right links.
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
}
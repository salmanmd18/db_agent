import AppointmentForm from "../AppointmentForm";

export default function AppointmentFormExample() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <AppointmentForm
        onSubmit={(data) => {
          console.log("Appointment submitted:", data);
          alert(`Appointment request submitted for ${data.name} at ${data.location}`);
        }}
        onCancel={() => {
          console.log("Appointment cancelled");
        }}
      />
    </div>
  );
}

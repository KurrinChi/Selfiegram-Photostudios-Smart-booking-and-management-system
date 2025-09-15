import AuthLayout from "../components/AuthLayout";
import RegisterInfoForm from "../components/RegisterInfoForm";

const Register = () => {
  return (
    <AuthLayout
      reverse={false}
      images={[
        {
          src: "../storage/packages/selfiefortwo/stwo4.png",
          label: "Create",
          className: "absolute bottom-[50%] left-[0%] z-10 w-[50%]",
        },
        {
          src: "../storage/packages/graduationelite/elite4.jpg",
          label: "Your",
          className: "absolute top-[20%] left-[50%]  z-20 w-[50%]",
        },
        {
          src: "../storage/packages/studiorental/studio2.jpg",
          label: "Story",
          className: "absolute top-[52%] left-[2%]  z-30 w-[50%]",
        },
      ]}
    >
      <RegisterInfoForm />
    </AuthLayout>
  );
};

export default Register;

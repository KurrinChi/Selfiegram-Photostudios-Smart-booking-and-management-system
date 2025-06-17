import AuthLayout from "../components/AuthLayout";
import RegisterInfoForm from "../components/RegisterInfoForm";


const Register = () => {
  return (
    <AuthLayout
      reverse={false}
      images={[
        {
          src: "../public/slfg-placeholder.png",
          label: "Create",
          className:
            "absolute bottom-[50%] left-[0%] z-10 w-[50%]",
        },
        {
          src: "../public/slfg-placeholder.png",
          label: "Your",
          className:
            "absolute top-[20%] left-[45%]  z-20 w-[50%]",
        },
        {
          src: "../public/slfg-placeholder.png",
          label: "Story",
          className:
            "absolute top-[48%] left-[5%]  z-30 w-[50%]",
        },
      ]}
    >
      <RegisterInfoForm />
    </AuthLayout>
  );
};

export default Register;

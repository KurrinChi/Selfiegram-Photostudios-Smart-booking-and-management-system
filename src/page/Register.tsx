import AuthLayout from "../components/AuthLayout";
import RegisterForm from "../components/RegisterForm";


const Register = () => {
  return (
    <AuthLayout
      reverse={false}
      images={[
        {
          src: "../public/slfg-placeholder.png",
          label: "Create",
          className:
            "absolute bottom-[50%] left-[0%] rotate-[-15deg] z-10 w-[50%]",
        },
        {
          src: "../public/slfg-placeholder.png",
          label: "Your",
          className:
            "absolute top-[20%] left-[50%] rotate-[-5deg] z-20 w-[50%]",
        },
        {
          src: "../public/slfg-placeholder.png",
          label: "Story",
          className:
            "absolute top-[48%] left-[0%] rotate-[15deg] z-30 w-[50%]",
        },
      ]}
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;


import ProfileForm from "../components/Forms/ProfileForm";

const Profile = () => {
  const style = {};
 

  return (
    <main>
      <div className="flex-row justify-space-between">
        <div className="col-12 mb-3">
          <ProfileForm />
        </div>
      </div>
      
    </main>
  );
};

export default Profile;

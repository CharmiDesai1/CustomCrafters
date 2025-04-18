import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./components/Login/LoginPage";
import { Signup } from "./components/Signup/Signup";
import DevelopersLandingPage from "./components/developers_landing/DevelopersLandingPage";
import SuggestionPage from "./components/suggestion_page/SuggestionPage";
import FloorPlanPage from "./components/floor_plans/FloorPlan";
import HomeUserPage from "./components/home_user/Home";
import SuggestionUserPage from "./components/Suggestion_user/Suggestions";
import { LoginStartPage } from './components/Login/LoginStartPage';
import { SignupStartPage } from './components/Signup/SignupStartPage';
import { LoginUser } from './components/Login/LoginUser';
import { SignupUser } from './components/Signup/SignupUser';
import FloorplanUser from './components/FloorPlans_User/FloorPlanUser';
import Timelineuser from './components/Timeline_user/TimeLineUser';
import Approve from './components/Approve_Reject/Suggestions';
import UpdateForm from './components/TimeLine_Update/DeveloperUpdateFrom';
import EditProfile from './components/Profile_User/EditProfile';
import ForgotResetPassword from './components/Profile_User/ForgotResetPassword';
import EditProfileDeveloper from './components/Profile/EditProfile';
import ForgotPassword from './components/Profile/ForgotResetPassword';

function App() {

  return (
    <Router>
    <div className = "App">
      <Routes>
        <Route path="/" element={<LoginStartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-user" element={<LoginUser />} />
        <Route path="/signup-start" element={<SignupStartPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup-user" element={<SignupUser />} />
        <Route path="/developers-landing-page" element={<DevelopersLandingPage />} />
        <Route path="/suggestion-page" element={<SuggestionPage />} />
        <Route path="/floor-plan-page" element={<FloorPlanPage />} />
        <Route path="/home-user-page" element={<HomeUserPage />} />
        <Route path="/suggestion-user-page" element={<SuggestionUserPage />} />
        <Route path="/floor-plan-user-page" element={<FloorplanUser />} />
        <Route path="/timeline-user-page" element={<Timelineuser />} />
        <Route path="/approve-page" element={<Approve />} />
        <Route path="/update-timeline-page/:propertyId" element={<UpdateForm />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/forgot-password" element={<ForgotResetPassword />} />
        <Route path="/edit-profile-developer" element={<EditProfileDeveloper />} />
        <Route path="/forgot-password-developer" element={<ForgotPassword />} />
      </Routes>
      </div>
    </Router>
  );
}

export default App;
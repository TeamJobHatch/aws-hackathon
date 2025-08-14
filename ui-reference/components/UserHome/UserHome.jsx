import React from 'react';

import ShowJobPositions from '../ManageJobPosition/ShowJobPositions'
import ManageResumes from '../ManageResume/ManageResumes'
import MatchHistory from '../ResumeJobMatch/matchHistory'
import MyPlans from '../ManageSubPlan/myPlan'


const UserHome = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <ShowJobPositions />
      <ManageResumes />
      <MyPlans />
      <MatchHistory />

    </div>
  );
};

export default UserHome;

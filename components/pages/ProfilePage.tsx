
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { signOutUser } from '../../services/firebase';
import Layout from '../Layout';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui';
import Icon from '../Icons';

// --- Profile Page ---
const ProfilePage: React.FC = () => {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOutUser();
        navigate('/login');
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-4xl font-bold">Profile</h1>
            </div>
            
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name</span>
                            <span>{userProfile?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span>{user?.email}</span>
                        </div>
                    </CardContent>
                </Card>

                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <Icon name="logout" className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </Layout>
    );
};

export default ProfilePage;
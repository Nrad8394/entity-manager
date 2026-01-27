/**
 * Profile Page
 * 
 * Comprehensive user profile management with:
 * - Profile photo upload/camera capture
 * - Personal information editing
 * - Password management
 * - Notification preferences
 * - Profile completion status tracking
 */

'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { usePageActions } from '@/app/dashboard/layout';
import { authApi } from '@/components/connectionManager/http/client';
import { toast } from 'sonner';
import { Loader2, Edit, Save, X, Camera, Upload, RotateCcw, Mail, Phone, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  is_active: boolean;
  is_approved: boolean;
  is_verified: boolean;
  profile_image?: string;
  profile_complete: boolean;
  profile_completed_at?: string;
  role_display?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const { setPageTitle, setPageSubtitle, setPageActions } = usePageActions();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageError, setImageError] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const pathname = usePathname();

  

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch current user profile
  useEffect(() => {
    setPageTitle('My Profile');
    setPageSubtitle('Manage your account settings and preferences');
    setPageActions(null);

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authApi.get<UserProfileData>('/api/v1/accounts/users/me/');
        setProfileData(response.data);
        // formData removed; profileData drives the form values
        setError(null);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data. Please try again.');
        toast.error('Failed to load profile', {
          description: 'Please refresh the page or try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setPageActions, setPageSubtitle, setPageTitle]);

  // Handle profile field update
  const handleFieldUpdate = async (field: string, value: string) => {
    if (!profileData) return;

    try {
      setIsSaving(true);
      const updateData: Record<string, unknown> = { [field]: value };
      
      await authApi.patch(`/api/v1/accounts/users/${profileData.id}/`, updateData);
      
      setProfileData({
        ...profileData,
        [field]: value,
      });
      
      setEditingField(null);
      toast.success('Profile updated', {
        description: `${field.replace(/_/g, ' ')} has been updated successfully.`,
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile', {
        description: 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Password mismatch', {
          description: 'New passwords do not match.',
        });
        return;
      }

      if (passwordData.newPassword.length < 8) {
        toast.error('Password too short', {
          description: 'Password must be at least 8 characters long.',
        });
        return;
      }

      setIsSaving(true);
      await authApi.post('/api/v1/accounts/users/change-password/', {
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
        new_password2: passwordData.confirmPassword,
      });

      toast.success('Password changed', {
        description: 'Your password has been updated successfully.',
      });

      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: unknown) {
      console.error('Failed to change password:', err);
      toast.error('Failed to change password', {
        description: 'Please check your current password and try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (file: File) => {
    if (!profileData?.id) return;

    setIsUploadingPhoto(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('profile_image', file);
      formDataObj.append('profile_complete', 'true');

      const response = await authApi.patch(
        `/api/v1/accounts/users/${profileData.id}/`,
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setProfileData({
        ...profileData,
        profile_image: response.data.profile_image || response.data.profile_picture,
        profile_complete: response.data.profile_complete || true,
      });

      setImageError(false);
      toast.success('Profile photo updated', {
        description: 'Your profile picture has been updated successfully.',
      });
    } catch (error: unknown) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photo', {
        description: 'Please try again.',
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    await handlePhotoUpload(file);
  };

  // Camera management
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      // store stream in ref to allow stable stopCamera without changing identity
      videoStreamRef.current = stream;
      setIsCameraActive(true);
      
      // Set stream after state updates are processed
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Please enable camera access to update your profile picture");
    }
  };

  const stopCamera = useCallback(() => {
    const stream = videoStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Ensure video has dimensions before drawing. Wait for loadedmetadata or small timeout.
    const ensureVideoReady = async () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) return;

      await new Promise<void>((resolve) => {
        const onLoaded = () => {
          cleanup()
          resolve()
        }

        const timeoutId = setTimeout(() => {
          cleanup()
          resolve()
        }, 1500)

        const cleanup = () => {
          video.removeEventListener('loadedmetadata', onLoaded)
          clearTimeout(timeoutId)
        }

        video.addEventListener('loadedmetadata', onLoaded)
      })
    }

    await ensureVideoReady();

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the raw video frame (CSS transforms do not affect drawImage)
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'profile-camera-capture.jpg', { type: 'image/jpeg' });
        stopCamera();
        await handlePhotoUpload(file);
      }
    }, 'image/jpeg', 0.95);
  };

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Ensure video element is bound to the stream when camera is active
  useEffect(() => {
    const stream = videoStreamRef.current;
    const videoEl = videoRef.current;
    if (isCameraActive && stream && videoEl) {
      videoEl.srcObject = stream;
      videoEl.play().catch(() => {});
    }

    return () => {
      if (videoEl) {
        try {
          (videoEl.srcObject as MediaStream | null) = null;
        } catch {}
      }
    };
  }, [isCameraActive]);

  // Ensure camera is stopped on navigation, tab hide, or page unload
  useEffect(() => {
    // stop camera when route changes
    stopCamera();

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stopCamera();
      }
    };

    const handlePageHide = () => stopCamera();
    const handleBeforeUnload = () => stopCamera();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const getImageSrc = () => {
    if (!profileData?.profile_image) return '';
    
    if (typeof window !== 'undefined') {
      try {
        // Check if it's an absolute URL
        const url = new URL(profileData.profile_image);
        // Add cache buster query parameter for absolute URLs
        url.searchParams.set('t', Date.now().toString());
        return url.toString();
      } catch {
        // If it fails, treat as relative URL
        try {
          const url = new URL(profileData.profile_image, window.location.href);
          url.searchParams.set('t', Date.now().toString());
          return url.toString();
        } catch {
          return profileData.profile_image;
        }
      }
    }
    
    return profileData.profile_image;
  };

  const getInitials = () => {
    if (!profileData?.first_name && !profileData?.last_name) return 'U';
    const firstInitial = profileData?.first_name ? profileData.first_name.charAt(0) : '';
    const lastInitial = profileData?.last_name ? profileData.last_name.charAt(0) : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleFileInputClick = () => {
    if (isUploadingPhoto) {
      setIsUploadingPhoto(false);
    }
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <p className="text-destructive mb-4">{error || 'Failed to load profile'}</p>
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Left Column - Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-primary/10">
                <AvatarImage 
                  src={imageError ? '' : getImageSrc()} 
                  alt={`${profileData?.first_name} ${profileData?.last_name}`}
                  onError={handleImageError}
                />
                <AvatarFallback className="text-xl font-semibold">{getInitials()}</AvatarFallback>
              </Avatar>

              {/* Name and Role */}
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg">
                  {`${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim() || 'User'}
                </h3>
                <p className="text-sm text-muted-foreground">{profileData?.role_display || 'Member'}</p>
                {profileData?.profile_complete && (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    Profile Complete
                  </span>
                )}
              </div>

              <Separator />

              {/* Photo Upload */}
              {!isCameraActive ? (
                <div className="w-full space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    id="photo-upload"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={isUploadingPhoto}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    disabled={isUploadingPhoto}
                    onClick={handleFileInputClick}
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={startCamera}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="relative bg-black rounded-lg overflow-hidden w-full aspect-video flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={captureImage}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Capture
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm" 
                      className="flex-1"
                      onClick={stopCamera}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              {/* Contact Info */}
              <div className="w-full space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">ID: {profileData?.id}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="truncate">{profileData?.email}</span>
                </div>
                {profileData?.is_verified && (
                  <div className="text-xs text-green-600 font-medium">✓ Email Verified</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Edit Forms */}
        <div className="space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Personal Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    {editingField === 'first_name' ? (
                      <div className="flex items-center gap-2">
                        <Input
                          id="first_name"
                          defaultValue={profileData.first_name}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleFieldUpdate('first_name', (e.target as HTMLInputElement).value);
                            }
                          }}
                          disabled={isSaving}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingField(null)}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById('first_name') as HTMLInputElement;
                            handleFieldUpdate('first_name', input.value);
                          }}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <span>{profileData.first_name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingField('first_name')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    {editingField === 'last_name' ? (
                      <div className="flex items-center gap-2">
                        <Input
                          id="last_name"
                          defaultValue={profileData.last_name}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleFieldUpdate('last_name', (e.target as HTMLInputElement).value);
                            }
                          }}
                          disabled={isSaving}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingField(null)}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById('last_name') as HTMLInputElement;
                            handleFieldUpdate('last_name', input.value);
                          }}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <span>{profileData.last_name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingField('last_name')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="flex-1"
                      />
                      {profileData.is_verified && (
                        <span className="text-xs text-green-600 font-medium">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your email address cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  {/* Account Status */}
                  <div className="pt-4 border-t space-y-2">
                    <Label>Account Status</Label>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Active:</span>{' '}
                        <span className="font-medium">{profileData.is_active ? 'Yes' : 'No'}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Verified:</span>{' '}
                        <span className="font-medium">{profileData.is_verified ? 'Yes' : 'No'}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Approved:</span>{' '}
                        <span className="font-medium">{profileData.is_approved ? 'Yes' : 'No'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Member Since */}
                  {profileData.created_at && (
                    <div className="text-xs text-muted-foreground">
                      Member since {new Date(profileData.created_at).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old_password">Current Password</Label>
                    <Input
                      id="old_password"
                      type="password"
                      placeholder="Enter your current password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      placeholder="Enter your new password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      disabled={isSaving}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      placeholder="Confirm your new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      disabled={isSaving}
                    />
                  </div>

                  <Button 
                    onClick={handleChangePassword} 
                    disabled={isSaving || !passwordData.oldPassword || !passwordData.newPassword}
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Additional preferences will be available here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// API functions for user profile management
export interface UpdateUserRequest {
  username?: string
  email?: string
  currentPassword?: string
  newPassword?: string
  timezone?: string
  email_notifications?: boolean
}

export interface UpdateUserResponse {
  success: boolean
  message: string
  user?: any
}

export async function updateUserProfile(updates: UpdateUserRequest): Promise<UpdateUserResponse> {
  try {
    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
      body: JSON.stringify(updates),
    })

    return await response.json()
  } catch (error) {
    console.error("Failed to update user profile:", error)
    return {
      success: false,
      message: "Failed to update profile. Please try again.",
    }
  }
}

export async function getUserProfile(): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    const response = await fetch("/api/user/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Failed to get user profile:", error)
    return {
      success: false,
      message: "Failed to load profile. Please try again.",
    }
  }
}

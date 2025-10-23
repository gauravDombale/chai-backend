import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //* get user details from frontend
  const { fullName, email, username, password } = req.body;

  //* validation - not empty
  if ([fullName, email, username, password].some((field) => !field)) {
    throw new ApiError(400, "All fields are required");
  }

  //* check if user already exists: username, email
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(409, "User with given email or username already exists");
  }

  //* check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  //* upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Error uploading avatar image");
  }

  let coverImage = null;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage) {
      throw new ApiError(500, "Error uploading cover image");
    }
  }

  //* create user object - create entry in db
  //* check for user creation
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  //* remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error creating user");
  }

  //* return res
  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));
});

export { registerUser };

import { IsNotEmpty, IsString } from "class-validator";

export class ResetPassDto {
  // @IsNotEmpty()
  // @IsString()
  // oldPassword: string;

  @IsNotEmpty({ message: "newPassword không được để trống" })
  @IsString()
  newPassword: string;
}
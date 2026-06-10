import { IsOptional, IsString } from 'class-validator';

export class AddMemberDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  roleInProject?: string;
}

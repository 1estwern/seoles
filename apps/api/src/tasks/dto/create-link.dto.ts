import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateLinkDto {
  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;
}

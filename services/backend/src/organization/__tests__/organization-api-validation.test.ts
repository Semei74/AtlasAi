import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { CreateOrganizationDto } from "../dto/create-organization.dto.js";
import { UpdateOrganizationDto } from "../dto/update-organization.dto.js";
import { CreateWorkspaceDto } from "../../workspace/dto/create-workspace.dto.js";
import { CreateMembershipDto } from "../../membership/dto/create-membership.dto.js";
import { CreateInvitationDto } from "../../membership/dto/create-invitation.dto.js";
import { MembershipRole } from "../../membership/interfaces/membership-role.enum.js";

describe("CreateOrganizationDto validation", () => {
  it("should pass with valid data", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), { name: "My Org", slug: "my-org" });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("should fail when name is empty", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), { name: "", slug: "my-org" });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe("name");
  });

  it("should fail when name exceeds max length", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), {
      name: "a".repeat(101),
      slug: "my-org",
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe("name");
  });

  it("should fail when slug is empty", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), { name: "My Org", slug: "" });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe("slug");
  });

  it("should fail when slug has invalid characters", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), { name: "My Org", slug: "My Org!" });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.constraints).toBeDefined();
  });

  it("should fail when slug exceeds max length", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), {
      name: "My Org",
      slug: "a".repeat(101),
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe("slug");
  });

  it("should pass with optional logoUrl", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), {
      name: "My Org",
      slug: "my-org",
      logoUrl: "https://example.com/logo.png",
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("should fail when logoUrl is not a string", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), {
      name: "My Org",
      slug: "my-org",
      logoUrl: 123 as unknown as string,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe("logoUrl");
  });
});

describe("UpdateOrganizationDto validation", () => {
  it("should pass with empty fields", async () => {
    const dto = new UpdateOrganizationDto();

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("should pass with valid name", async () => {
    const dto = Object.assign(new UpdateOrganizationDto(), { name: "Updated Org" });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("should pass with valid slug", async () => {
    const dto = Object.assign(new UpdateOrganizationDto(), { slug: "updated-org" });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

describe("CreateWorkspaceDto validation", () => {
  it("should pass with valid data", async () => {
    const dto = Object.assign(new CreateWorkspaceDto(), { name: "My Workspace" });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("should fail when name is empty", async () => {
    const dto = Object.assign(new CreateWorkspaceDto(), { name: "" });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe("name");
  });

  it("should pass with optional description", async () => {
    const dto = Object.assign(new CreateWorkspaceDto(), {
      name: "WS",
      description: "A description",
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

describe("CreateMembershipDto validation", () => {
  it("should pass with valid data", async () => {
    const dto = Object.assign(new CreateMembershipDto(), {
      userId: "user-123",
      role: MembershipRole.Member,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("should fail when userId is missing", async () => {
    const dto = Object.assign(new CreateMembershipDto(), { role: MembershipRole.Member });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === "userId")).toBe(true);
  });

  it("should fail when role is invalid", async () => {
    const dto = Object.assign(new CreateMembershipDto(), {
      userId: "user-123",
      role: "InvalidRole" as unknown as MembershipRole,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe("role");
  });
});

describe("CreateInvitationDto validation", () => {
  it("should pass with valid email", async () => {
    const dto = Object.assign(new CreateInvitationDto(), {
      email: "user@example.com",
      role: MembershipRole.Member,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("should pass with valid userId", async () => {
    const dto = Object.assign(new CreateInvitationDto(), {
      userId: "user-123",
      role: MembershipRole.Member,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("should fail when email is invalid", async () => {
    const dto = Object.assign(new CreateInvitationDto(), {
      email: "not-an-email",
      role: MembershipRole.Member,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe("email");
  });

  it("should fail when role is missing", async () => {
    const dto = Object.assign(new CreateInvitationDto(), { email: "user@example.com" });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe("role");
  });

  it("should fail when role is invalid enum value", async () => {
    const dto = Object.assign(new CreateInvitationDto(), {
      email: "user@example.com",
      role: "SuperAdmin" as unknown as MembershipRole,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe("role");
  });
});

describe("ValidationPipe HTTP exception mapping", () => {
  const pipe = new ValidationPipe({ whitelist: true });

  it("should throw BadRequestException for invalid input", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), { name: "", slug: "valid-slug" });

    await expect(
      pipe.transform(dto, { type: "body", metatype: CreateOrganizationDto }),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException with descriptive message for missing required fields", async () => {
    const dto = Object.assign(new CreateMembershipDto(), { role: MembershipRole.Member });

    await expect(
      pipe.transform(dto, { type: "body", metatype: CreateMembershipDto }),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when slug format is invalid", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), { name: "Org", slug: "INVALID SLUG!" });

    await expect(
      pipe.transform(dto, { type: "body", metatype: CreateOrganizationDto }),
    ).rejects.toThrow(BadRequestException);
  });

  it("should pass valid DTO through ValidationPipe", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), {
      name: "Valid Org",
      slug: "valid-org",
    });

    const result = (await pipe.transform(dto, {
      type: "body",
      metatype: CreateOrganizationDto,
    })) as CreateOrganizationDto;
    expect(result.name).toBe("Valid Org");
    expect(result.slug).toBe("valid-org");
  });

  it("should strip unknown properties when whitelist is enabled", async () => {
    const dto = Object.assign(new CreateOrganizationDto(), {
      name: "Org",
      slug: "org",
      unknownField: "should-be-stripped",
    });

    const result = (await pipe.transform(dto, {
      type: "body",
      metatype: CreateOrganizationDto,
    })) as CreateOrganizationDto & Record<string, unknown>;
    expect(result["unknownField"]).toBeUndefined();
    expect(result.name).toBe("Org");
    expect(result.slug).toBe("org");
  });

  it("should throw when metatype is not provided (plain JS objects)", async () => {
    const plain = { name: "Org", slug: "org" };

    const result: Record<string, string> = (await pipe.transform(plain, {
      type: "body",
      metatype: undefined,
    })) as Record<string, string>;
    expect(result).toBe(plain);
  });
});

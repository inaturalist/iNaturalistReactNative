import { useRoute } from "@react-navigation/native";
import { render, screen } from "@testing-library/react-native";
import ProjectListContainer from "components/ProjectList/ProjectListContainer";
import React from "react";
import factory from "tests/factory";

const mockProjects = [
  factory("RemoteProject", {
    title: "project_1",
  }),
  factory("RemoteProject", {
    title: "project_2",
  }),
];

const mockNonTraditionalProjects = [
  factory("RemoteProject", {
    title: "non_traditional_project_1",
  }),
  factory("RemoteProject", {
    title: "non_traditional_project_2",
  }),
];

const mockObservationUuid = "00000000-0000-0000-0000-000000000001";

jest.mock("sharedHooks/useRemoteObservation", () => ({
  __esModule: true,
  default: () => ({
    remoteObservation: {
      project_observations: mockProjects.map(project => ({ project })),
      non_traditional_projects: mockNonTraditionalProjects.map(project => ({ project })),
    },
    refetchRemoteObservation: jest.fn(),
    isRefetching: false,
    fetchRemoteObservationError: null,
  }),
}));

const mockUseAuthenticatedQuery = jest.fn(() => ({ data: null }));
jest.mock("sharedHooks/useAuthenticatedQuery", () => ({
  __esModule: true,
  default: (...args) => mockUseAuthenticatedQuery(...args),
}));

describe("ProjectListContainer", () => {
  describe("observationUuid path", () => {
    beforeAll(() => {
      useRoute.mockImplementation(() => ({
        params: {
          observationUuid: mockObservationUuid,
        },
      }));
    });

    it("should display a list with all project titles", async () => {
      render(<ProjectListContainer />);
      const firstProjectTitle = await screen.findByText(mockProjects[0].title);
      expect(firstProjectTitle).toBeVisible();
      const secondProjectTitle = await screen.findByText(mockProjects[1].title);
      expect(secondProjectTitle).toBeVisible();
      const firstTitle = await screen.findByText(mockNonTraditionalProjects[0].title);
      expect(firstTitle).toBeVisible();
      const secondTitle = await screen.findByText(mockNonTraditionalProjects[1].title);
      expect(secondTitle).toBeVisible();
    });
  });

  describe("userId path", () => {
    const mockUserId = 123;

    beforeAll(() => {
      useRoute.mockImplementation(() => ({
        params: {
          userId: mockUserId,
        },
      }));
      mockUseAuthenticatedQuery.mockReturnValue({ data: mockProjects });
    });

    it("should display a list with all project titles from user projects", async () => {
      render(<ProjectListContainer />);
      const firstProjectTitle = await screen.findByText(mockProjects[0].title);
      expect(firstProjectTitle).toBeVisible();
      const secondProjectTitle = await screen.findByText(mockProjects[1].title);
      expect(secondProjectTitle).toBeVisible();
    });

    it("should call useAuthenticatedQuery with the correct query key", () => {
      render(<ProjectListContainer />);
      expect(mockUseAuthenticatedQuery).toHaveBeenCalledWith(
        ["fetchUserProjects", mockUserId],
        expect.any(Function),
        expect.objectContaining({ enabled: true }),
      );
    });
  });
});

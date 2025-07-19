"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { UserProfile } from "@/types/user";
import LinearProgress from "@mui/material/LinearProgress";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { useQuery } from "@tanstack/react-query";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridSlots,
  GridFilterModel,
} from "@mui/x-data-grid";
import { Button, Box, Grid } from "@mui/material";
import AuthorizationCheck from "@/components/AuthorizationCheck";
import { permissionCode } from "@/utils/permissionCode";
import useCheckFeatureAuthorization from "@/hooks/useCheckFeatureAuthorization";
import useLang from "@/store/lang";
import {
  GetContext,
  getCollectionMethodLabel,
  getLocaleValue,
  getStatusLabel,
} from "@/utils/language";
import CustomToolbar from "@/components/DataGridToolbar";
import HeaderTitle from "@/components/HeaderTitle";
import TopicIcon from "@mui/icons-material/Topic";
import TableActionMenu from "@/components/dashboard/project-management/table-action-menu";

export interface Filter {
  index: number;
  function: string;
  values: any[];
}

export interface Indicator {
  label: string;
  description: string;
  filters: Filter[];
}

export interface Project {
  id: string;
  projectId: string;
  name: {
    en: string;
    km: string;
  };
  description: string;
  project_location: string;
  questions: string[];
  users: string[];
  indicators: Indicator[];
  created_by: string;
  status: number;
  data_collected: number;
  created_at: string;
  updated_at: string;
  code: string | null;
  method?: number;
}

const fetchUsersWithStatus = async (): Promise<UserProfile[]> => {
  try {
    const response = await axios.get("/api/get-all-user");
    return response.data.data.user;
  } catch (error) {
    console.error("Error fetching users with status 1:", error);
    throw error;
  }
};

const ProjectHistoryPage = () => {
  const lang = useLang((state) => state.lang);
  const canUpdateProjectStatus = useCheckFeatureAuthorization(
    permissionCode.updateProjectStatus,
  );
  const canDeleteProject = useCheckFeatureAuthorization(
    permissionCode.deleteProject,
  );
  const canCloneProject = useCheckFeatureAuthorization(
    permissionCode.cloneProject,
  );
  const canEditProject = useCheckFeatureAuthorization(
    permissionCode.updateProjectDetails,
  );
  const canAssignUser = useCheckFeatureAuthorization(
    permissionCode.updateProjectDetails,
  );
  const canCreateProject = useCheckFeatureAuthorization(
    permissionCode.createProject,
  );
  const [rowSize, setRowSize] = useState<number>(0);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [""],
  });
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  const fetchAllProject = async (): Promise<Project[]> => {
    let query = "";
    if (
      filterModel.quickFilterValues &&
      filterModel.quickFilterValues.length > 0
    ) {
      query = filterModel.quickFilterValues[0];
    }
    const response = await axios.get("/api/config", {
      params: {
        endpoint: `project/all?data_collected=1&limit=${paginationModel.pageSize}&page=${
          paginationModel.page + 1
        }&query=${query}`,
      },
    });

    console.log("All proj: ", response);

    setRowSize(response.data.data.count);

    return response.data.data.projects;
  };

  const {
    data: projects = [],
    isLoading: isTableLoading,
    isError,
  } = useQuery<Project[]>({
    queryKey: ["AllProjects", paginationModel, filterModel],
    queryFn: fetchAllProject,
  });

  const { data: fetchedUserData = [] } = useQuery<UserProfile[]>({
    queryKey: ["allUsers"],
    queryFn: fetchUsersWithStatus,
  });

  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: "id",
        headerName: GetContext("no", lang),
        cellClassName: "text-left",
        flex: 0.4,
        headerClassName: "super-app-theme--header",
      },
      {
        field: "name",
        headerName: GetContext("name", lang),
        cellClassName: "text-left",
        flex: 1.6,
        headerClassName: "super-app-theme--header",
        renderCell: (params: any) => {
          return (
            <Box>
              <Box component="span">{getLocaleValue(params.value, lang)}</Box>
            </Box>
          );
        },
      },
      {
        field: "status",
        headerName: GetContext("status", lang),
        cellClassName: "text-left",
        flex: 1,
        headerClassName: "super-app-theme--header",
        renderCell: (params: any) => {
          let backgroundColor;
          let textColor;
          let textStatus;

          switch (params.value) {
            case 0:
              backgroundColor = "rgba(255, 0, 0, 0.1)";
              textColor = "red";
              textStatus = GetContext("inactive", lang);
              break;
            case 1:
              backgroundColor = "rgba(0, 255, 0, 0.1)";
              textColor = "green";
              textStatus = GetContext("active", lang);
              break;
            case 2:
              backgroundColor = "rgba(77,171,245,0.1)";
              textColor = "rgb(77,171,245)";
              textStatus = GetContext("completed_project", lang);
              break;
            default:
              backgroundColor = "rgba(0, 0, 0, 0.1)";
              textColor = "rgb(77,171,245)";
              textStatus = GetContext("not_set", lang);
              break;
          }

          return (
            <Box>
              <Box
                component="span"
                sx={{
                  backgroundColor,
                  color: textColor,
                  borderRadius: "24px",
                  padding: "0.3rem 0.8rem",
                }}
              >
                {getStatusLabel(params.value, lang)}
              </Box>
            </Box>
          );
        },
      },
      {
        field: "collectionMethod",
        headerName: GetContext("collection_method", lang),
        cellClassName: "text-left",
        flex: 1,
        headerClassName: "super-app-theme--header",
        renderCell: (params: any) => {
          return <Box>{getCollectionMethodLabel(params.value, lang)}</Box>;
        },
      },
      {
        field: "data_collected",
        headerName: GetContext("data_collected", lang),
        cellClassName: "text-left",
        flex: 1,
        headerClassName: "super-app-theme--header",
        renderCell: (params: any) => {
          if (params.value === undefined) return;
          return <Box>{params.value}</Box>;
        },
      },
      {
        field: "isStarted",
        headerName: GetContext("started_collection", lang),
        cellClassName: "text-left",
        flex: 1,
        headerClassName: "super-app-theme--header",
        renderCell: (params: any) => {
          if (params.value === undefined) return;

          let backgroundColor;
          let textColor;
          let textValue;

          switch (params.value) {
            case true:
              backgroundColor = "rgba(0, 255, 0, 0.1)";
              textColor = "green";
              textValue = "Yes";
              break;
            case false:
              backgroundColor = "rgba(255, 0, 0, 0.1)";
              textColor = "red";
              textValue = "No";
              break;
            default:
              backgroundColor = "rgba(0, 0, 0, 0.1)";
              textColor = "rgb(77,171,245)";
              textValue = "Unknown";
              break;
          }

          return (
            <Box>
              <Box
                component="span"
                sx={{
                  backgroundColor,
                  color: textColor,
                  borderRadius: "24px",
                  padding: "0.3rem 0.8rem",
                }}
              >
                {textValue}
              </Box>
            </Box>
          );
        },
      },
      {
        field: "created_at",
        headerName: GetContext("created_at", lang),
        cellClassName: "text-left",
        flex: 1,
        headerClassName: "super-app-theme--header",
        valueGetter: (params: any) => params.substring(0, 10),
      },
      {
        field: "action",
        headerName: GetContext("action", lang),
        flex: 0.5,
        headerClassName: "super-app-theme--header",
        renderCell: (params: GridRenderCellParams<Project>) => (
          <TableActionMenu
            row={params.row}
            users={fetchedUserData}
            canAssignUser={canAssignUser}
            canEditProject={canEditProject}
            canCloneProject={canCloneProject}
            canDeleteProject={canDeleteProject}
            canUpdateProjectStatus={canUpdateProjectStatus}
          />
        ),
      },
    ],
    [
      fetchedUserData,
      canAssignUser,
      canEditProject,
      canCloneProject,
      canDeleteProject,
      canUpdateProjectStatus,
      lang,
    ],
  );

  const rows = projects.map((project: Project, index) => ({
    ...project,
    id: paginationModel.page * paginationModel.pageSize + index + 1,
    projectId: project.id,
    status: project.status ?? 0,
    isStarted: project.data_collected > 0 ? true : false,
    collectionMethod: project?.method ?? 0,
    users: fetchedUserData.filter((user) => project.users.includes(user.id)),
  }));

  const handleFilterModelChange = (event: GridFilterModel) => {
    if (event.quickFilterValues) {
      if (event.quickFilterValues.length == 0) {
        setFilterModel({ ...event, quickFilterValues: [""] });
      } else {
        setFilterModel(event);
      }
      setPaginationModel({ ...paginationModel, page: 0 });
    }
  };

  if (isError) return <div>Error loading projects</div>;

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.viewProjectHistory}>
      <Grid container className="w-full h-full">
        <Grid item xs={12}>
          <Box className="flex justify-between items-center mb-4">
            <HeaderTitle
              icon={<TopicIcon color="primary" sx={{ fontSize: "1.4rem" }} />}
              title={GetContext("project_management", lang)}
            />
            {canCreateProject && (
              <div>
                <Link href="/dashboard/create-project">
                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                    sx={{ borderRadius: "14px", fontSize: "1rem" }}
                  >
                    {GetContext("create_project", lang)}
                  </Button>
                </Link>
              </div>
            )}
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{ width: "100%", height: "100%" }}
          className="border-1 boxShadow-1"
        >
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={rowSize}
            paginationMode="server"
            paginationModel={paginationModel}
            filterModel={filterModel}
            filterMode="server"
            onPaginationModelChange={setPaginationModel}
            onFilterModelChange={handleFilterModelChange}
            initialState={{
              filter: {
                filterModel: {
                  items: [],
                  quickFilterValues: [""],
                },
              },
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            slots={{
              toolbar: CustomToolbar,
              loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
            }}
            loading={isTableLoading}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            autoHeight
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            disableRowSelectionOnClick
            disableColumnSorting
            disableColumnMenu
            pageSizeOptions={[10, 25, 50, 100]}
            columnVisibilityModel={{
              action:
                canUpdateProjectStatus ||
                canDeleteProject ||
                canCloneProject ||
                canEditProject
                  ? true
                  : false,
            }}
            sx={{
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: "0px",
              "& .super-app-theme--header": {
                backgroundColor: "rgba(230,242,242,0.5)",
              },
              "& .MuiDataGrid-columnHeaders": {
                fontSize: "1rem",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "semibold",
              },
              "& .MuiDataGrid-main > *:first-of-type": {
                borderTopRightRadius: "0px",
                borderTopLeftRadius: "0px",
              },
            }}
          />
        </Grid>
      </Grid>
    </AuthorizationCheck>
  );
};

export default ProjectHistoryPage;

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import type { MenuCategoryMetadata, MenuItem } from "../../types/menu";
import { formatCurrency } from "../../utils/formatCurrency";

interface TableOrderMenuProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  items: MenuItem[];
  categoryMetadata: Record<string, MenuCategoryMetadata>;
  onAddItem: (item: MenuItem) => void;
  cartMenuItemIds: string[];
  currencyCode: string;
}

const TableOrderMenu = ({
  categories,
  selectedCategory,
  onCategoryChange,
  items,
  categoryMetadata,
  onAddItem,
  currencyCode,
}: TableOrderMenuProps) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Menu
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
        }}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            label={category}
            clickable
            color={
              selectedCategory === category
                ? "primary"
                : "default"
            }
            onClick={() => onCategoryChange(category)}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))",
          alignItems: "stretch",
          gap: 1.5,
          minWidth: 0,
        }}
      >
        {items.map((item) => {
          const isCategoryInactive =
            categoryMetadata[
              item.category.trim().replace(/\s+/g, " ").toLowerCase()
            ]?.status === "Inactive";

          return (
            <Card
              key={item.id}
              variant="outlined"
              sx={{
                display: "flex",
                flexDirection: "column",
                height: 210,
                minWidth: 0,
                borderRadius: 2,
                borderColor: isCategoryInactive ? "grey.300" : "divider",
                bgcolor: isCategoryInactive ? "grey.50" : "background.paper",
                transition: "border-color 150ms ease, box-shadow 150ms ease",
                "&:hover": isCategoryInactive
                  ? undefined
                  : {
                      borderColor: "primary.light",
                      boxShadow: "0 4px 14px rgba(234, 88, 12, 0.08)",
                    },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minHeight: 0,
                  p: 1.5,
                  "&:last-child": { pb: 1.5 },
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{
                    lineHeight: 1.3,
                    minHeight: 36,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflowWrap: "anywhere",
                  }}
                >
                  {item.name}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    height: 34,
                    lineHeight: 1.4,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflowWrap: "anywhere",
                  }}
                >
                  {item.description || " "}
                </Typography>

                <Box
                  sx={{
                    mt: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    {formatCurrency(item.price, currencyCode)}
                  </Typography>

                  <Box sx={{ height: 20, display: "flex", alignItems: "center" }}>
                    {isCategoryInactive && (
                      <Chip
                        size="small"
                        label="Category Inactive"
                        color="warning"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.65rem" }}
                      />
                    )}
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    disabled={
                      isCategoryInactive ||
                      !item.isAvailable ||
                      item.stockStatus === "Out of Stock"
                    }
                    onClick={() => onAddItem(item)}
                    sx={{
                      minHeight: 34,
                      maxHeight: 34,
                      borderRadius: 1.5,
                      py: 0,
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      ...(isCategoryInactive && {
                        bgcolor: "grey.200",
                        color: "text.secondary",
                        "&.Mui-disabled": {
                          bgcolor: "grey.200",
                          color: "text.secondary",
                        },
                      }),
                    }}
                  >
                    {isCategoryInactive ||
                    !item.isAvailable ||
                    item.stockStatus === "Out of Stock"
                      ? "Unavailable"
                      : "Add"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default TableOrderMenu;

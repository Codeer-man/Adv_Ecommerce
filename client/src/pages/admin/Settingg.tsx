import { ImagePlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useAdminSetting } from "../../feature/admin/setting/use-admin-setting";
import { Button } from "../../components/ui/button";
import AdminSettingBanner from "../../components/admin/settings/admin-banner-setting";

const pageWrapClass = "min-h-screen bg-background";
const contentContainerClass = "mx-auto max-w-7xl px-4 py-8";
const uploadPanelClass = "grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]";

const cardClass = "border-border/60 bg-card/80";
const cardTitleClass = "text-2xl font-semibold text-foreground";
const cardContentClass = "space-y-6";

const uploadBoxClass =
  "flex min-h-[220px] flex-col items-center justify-center gap-4 border border-dashed border-border bg-background/40 p-6 text-center";
const uploadIconWrapClass =
  "flex h-14 w-14 items-center justify-center border border-border bg-secondary/50";
const uploadIconClass = "h-6 w-6 text-primary";
const uploadTextWrapClass = "space-y-2";
const uploadHeadingClass = "text-base font-medium text-foreground";
const fileInputClass = "rounded-none";
const fullButtonClass = "w-full rounded-none";
const buttonClass = "rounded-none";
const emptyStateClass =
  "border border-border bg-background/40 p-6 text-sm text-muted-foreground";
const tableHeaderClass = "flex flex-row items-center justify-between gap-3";

export default function AdminSetting() {
  const {
    files,
    setFiles,
    RefreshAlll,
    handleUpload,
    isLoading,
    items,
    uploading,
  } = useAdminSetting();

  return (
    <div className={pageWrapClass}>
      <div className={contentContainerClass}>
        <div className={uploadPanelClass}>
          <Card>
            <CardHeader>
              <CardTitle>Banner Settings</CardTitle>
            </CardHeader>
            <CardContent className={cardContentClass}>
              <div className={uploadBoxClass}>
                <div className={uploadIconWrapClass}>
                  <ImagePlus className={uploadIconClass} />
                </div>
                <div className={uploadTextWrapClass}>
                  <p className={uploadHeadingClass}>Upload Home Banner</p>
                </div>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  className={fileInputClass}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      setFiles(Array.from(files));
                    }
                  }}
                />
                <Button
                  className={fullButtonClass}
                  disabled={uploading || !files.length}
                  onClick={handleUpload}
                >
                  {uploading ? "Uploading..." : "Upload Banner"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/*  show the images in the right sides */}
          <Card className={cardClass}>
            <CardHeader className={tableHeaderClass}>
              <CardTitle className={cardTitleClass}>Banner Images</CardTitle>
              <Button className={buttonClass} onClick={RefreshAlll}>
                Refresh
              </Button>
            </CardHeader>

            <CardContent className={cardContentClass}>
              {isLoading ? (
                <div className={emptyStateClass}>Loading...</div>
              ) : items.length === 0 ? (
                <div className={emptyStateClass}>No images uploaded</div>
              ) : (
                <AdminSettingBanner items={items} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

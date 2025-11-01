import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts";
import {
  getSpaces,
  createSpace,
  togglePinSpace,
  updateSpace,
  deleteSpace,
} from "../../services/firebase";
import type { Space } from "../../types";
import Layout from "../Layout";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Spinner,
  Textarea,
  ConfirmDialog,
} from "../ui";
import Icon from "../Icons";
import { Timestamp } from "@firebase/firestore";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";

// === Dialog untuk membuat Space baru ===
const CreateSpaceDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await createSpace(user.uid, name, description);
      setName("");
      setDescription("");
      onCreated();
    } catch (error) {
      console.error("Error creating space:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Research Space</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="space-name">Space Name</Label>
              <Input
                id="space-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Avocado Ripeness Detection"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="space-description">Description</Label>
              <Textarea
                id="space-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short summary of your research"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// === Dialog untuk mengedit Space ===
const EditSpaceDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  space: Space | null;
}> = ({ isOpen, onClose, space }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (space) {
      setName(space.name);
      setDescription(space.description);
    }
  }, [space]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !space) return;
    setLoading(true);
    try {
      await updateSpace(user.uid, space.id, { name, description });
      onClose();
    } catch (error) {
      console.error("Error updating space:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Research Space</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="space-name-edit">Space Name</Label>
              <Input
                id="space-name-edit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="space-description-edit">Description</Label>
              <Textarea
                id="space-description-edit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// === Komponen Kartu untuk Space ===
const SpaceCard: React.FC<{
  space: Space;
  onEdit: (space: Space) => void;
  onDelete: (spaceId: string) => void;
}> = ({ space, onEdit, onDelete }) => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "Not yet";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const handlePinToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      togglePinSpace(user.uid, space.id, !!space.pinned);
    }
  };

  const handleMenuAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setMenuOpen(false);
  };

  return (
    <div className="relative group animate-fade-in">
      <Link
        to={`/spaces/${space.id}`}
        className="block transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl focus:scale-[1.02] focus:shadow-xl rounded-2xl"
      >
        <Card className="h-full border-t-4 border-primary">
          <CardHeader>
            <CardTitle className="truncate pr-20">{space.name}</CardTitle>
            <CardDescription className="truncate">
              {space.description || "No description"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {space.pinned && (
              <div className="flex items-center gap-2 text-primary font-medium text-xs bg-secondary px-2.5 py-1 rounded-full w-fit">
                <Icon name="pinFilled" className="w-3.5 h-3.5" />
                <span>Pinned</span>
              </div>
            )}
            <p>{space.progressCount ?? 0} progress reports</p>
            <p>Last updated: {formatDate(space.lastUpdated!)}</p>
          </CardContent>
        </Card>
      </Link>

      <div className="absolute top-2 right-2 flex items-center">
        <button
          onClick={handlePinToggle}
          className={`p-2 rounded-full bg-card/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-opacity ${
            space.pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus:opacity-100"
          }`}
          aria-label={space.pinned ? "Unpin space" : "Pin space"}
        >
          <Icon name={space.pinned ? "pinFilled" : "pin"} className="w-5 h-5 text-primary" />
        </button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 mt-2 w-40 bg-card border rounded-lg shadow-xl z-20">
                <div className="p-1">
                  <button
                    onClick={(e) => handleMenuAction(e, () => onEdit(space))}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => handleMenuAction(e, () => onDelete(space.id))}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// === Halaman Daftar Spaces ===
const SpacesPage: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [spaceToEdit, setSpaceToEdit] = useState<Space | null>(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [spaceToDeleteId, setSpaceToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = getSpaces(user.uid, (fetchedSpaces) => {
      setSpaces(fetchedSpaces);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleEdit = (space: Space) => {
    setSpaceToEdit(space);
    setEditDialogOpen(true);
  };

  const handleDeleteRequest = (spaceId: string) => {
    setSpaceToDeleteId(spaceId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !spaceToDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteSpace(user.uid, spaceToDeleteId);
    } catch (err) {
      console.error("Failed to delete space:", err);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setSpaceToDeleteId(null);
    }
  };

  return (
    <Layout onFabClick={() => setCreateDialogOpen(true)}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Your Spaces</h1>
        <Button className="hidden md:inline-flex items-center gap-2" onClick={() => setCreateDialogOpen(true)}>
          <Icon name="plus" className="w-4 h-4" />
          Create Space
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-20">
          <Spinner size="lg" />
        </div>
      ) : spaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="text-center mt-20 p-8 border-2 border-dashed rounded-2xl animate-fade-in">
          <Icon name="folder" className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Spaces Yet</h2>
          <p className="mt-2 text-muted-foreground">
            Tap the '+' button below to start a new research space.
          </p>
          <Button className="mt-6 md:hidden" onClick={() => setCreateDialogOpen(true)}>
            Create your first space
          </Button>
        </div>
      )}

      <CreateSpaceDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => setCreateDialogOpen(false)}
      />

      <EditSpaceDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSpaceToEdit(null);
        }}
        space={spaceToEdit}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Space?"
        description="Apakah Anda yakin ingin menghapus space ini beserta semua laporannya? Tindakan ini tidak dapat dibatalkan."
        loading={isDeleting}
      />
    </Layout>
  );
};

export default SpacesPage;

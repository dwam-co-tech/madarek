export type Dossier = {
  id: number;
  issue_id: number;
  title: string;
  slug: string;
  intro: string | null;
  cover_image: string | null;
  status: 'draft' | 'published';
  article_ids: number[];
  created_at: string;
  updated_at: string;
};

export type CreateDossierPayload = {
  title: string;
  slug: string;
  intro: string;
  status: Dossier['status'];
  article_ids: number[];
  cover_image?: File;
};

export type UpdateDossierPayload = Omit<CreateDossierPayload, 'cover_image'> & {
  cover_image?: File | null;
};

export type DossierResponse = { message: string; dossier: Dossier };
export type DossierDetailResponse = { dossier: Dossier };
export type DeleteDossierResponse = { message: string };

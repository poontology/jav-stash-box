package api

import (
	"context"

	"github.com/gofrs/uuid"
	"github.com/stashapp/stash-box/pkg/models"
)

func (r *mutationResolver) FingerprintPartUpdate(ctx context.Context, sceneID uuid.UUID, fingerprintID int, part int) (bool, error) {
	repo := r.getRepoFactory(ctx)

	fingerprints, err := repo.Scene().GetFingerprints(sceneID)
	if err != nil {
		return false, err
	}

	var fingerprint *models.SceneFingerprint
	for _, f := range fingerprints {
		if f.ID == fingerprintID {
			fingerprint = f
			break
		}
	}

	if fingerprint == nil {
		return false, nil
	}

	fingerprint.Part = part

	err = repo.WithTxn(func() error {
		return repo.Scene().CreateOrReplaceFingerprints(models.SceneFingerprints{fingerprint})
	})
	if err != nil {
		return false, err
	}

	return true, nil
}

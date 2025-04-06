import { FC, useState } from "react";
import { Button, Form, InputGroup, Row, Table } from "react-bootstrap";
import {
  faSortAmountUp,
  faSortAmountDown,
} from "@fortawesome/free-solid-svg-icons";

import {
  useScenesWithFingerprints,
  SceneQueryInput,
  SortDirectionEnum,
  SceneSortEnum,
  useUnmatchFingerprint,
  FingerprintAlgorithm,
  CriterionModifier,
  useUpdateFingerprintPart,
} from "src/graphql";
import { usePagination, useQueryParams } from "src/hooks";
import { ensureEnum } from "src/utils";
import { ErrorMessage, Icon } from "src/components/fragments";
import List from "src/components/list/List";
import Modal from "src/components/modal";
import TagFilter from "src/components/tagFilter";
import UserSceneLine from "./UserSceneLine";

const PER_PAGE = 20;

interface Props {
  perPage?: number;
  filter?: Partial<SceneQueryInput>;
}

const sortOptions = [
  { value: SceneSortEnum.DATE, label: "Release Date" },
  { value: SceneSortEnum.TITLE, label: "Title" },
  { value: SceneSortEnum.CODE, label: "Code" },
  { value: SceneSortEnum.TRENDING, label: "Trending" },
  { value: SceneSortEnum.CREATED_AT, label: "Created At" },
  { value: SceneSortEnum.UPDATED_AT, label: "Updated At" },
];

export const UserFingerprintsList: FC<Props> = ({
  perPage = PER_PAGE,
  filter,
}) => {
  const [deletionCandidates, setDeletionCandidates] = useState<
    {
      hash: string;
      scene_id: string;
      algorithm: FingerprintAlgorithm;
      duration: number;
    }[]
  >([]);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteFingerprint] = useUnmatchFingerprint();
  const [updatePart] = useUpdateFingerprintPart();
  const [params, setParams] = useQueryParams({
    sort: { name: "sort", type: "string", default: SceneSortEnum.DATE },
    dir: { name: "dir", type: "string", default: SortDirectionEnum.DESC },
    tag: { name: "tag", type: "string" },
  });
  const sort = ensureEnum(SceneSortEnum, params.sort);
  const direction = ensureEnum(SortDirectionEnum, params.dir);

  const { page, setPage } = usePagination();
  const { loading, data, refetch } = useScenesWithFingerprints({
    input: {
      page,
      per_page: perPage,
      sort,
      direction,
      ...filter,
      tags: params.tag
        ? { value: [params.tag], modifier: CriterionModifier.INCLUDES }
        : undefined,
    },
    submitted: true,
  });

  if (!loading && !data) return <ErrorMessage error="Failed to load scenes." />;

  const filters = (
    <InputGroup className="scene-sort w-auto">
      <TagFilter tag={params.tag} onChange={(t) => setParams("tag", t?.id)} />
      <Form.Select
        className="w-auto"
        onChange={(e) => setParams("sort", e.currentTarget.value.toLowerCase())}
        defaultValue={sort ?? "name"}
      >
        {sortOptions.map((s) => (
          <option value={s.value} key={s.value}>
            {s.label}
          </option>
        ))}
      </Form.Select>
      <Button
        variant="secondary"
        onClick={() =>
          setParams(
            "dir",
            direction === SortDirectionEnum.DESC
              ? SortDirectionEnum.ASC
              : SortDirectionEnum.DESC,
          )
        }
      >
        <Icon
          icon={
            direction === SortDirectionEnum.DESC
              ? faSortAmountDown
              : faSortAmountUp
          }
        />
      </Button>
    </InputGroup>
  );

  const deleteFingerprints = (
    fingerprints: {
      scene_id: string;
      hash: string;
      algorithm: FingerprintAlgorithm;
      duration: number;
    }[],
  ) => {
    setDeletionCandidates(fingerprints);
    setShowDelete(true);
  };

  const handleDelete = async (status: boolean) => {
    if (status && deletionCandidates.length) {
      for (const candidate of deletionCandidates) {
        await deleteFingerprint({
          variables: candidate,
        });
      }
    }
    setDeletionCandidates([]);
    setShowDelete(false);
  };

  const handlePartChange = async (sceneId: string, fingerprintId: number) => {
    const part = prompt("Part number");
    if (part === null) return;

    const partNum = parseInt(part, 10);
    if (isNaN(partNum)) {
      alert("Please enter a valid number");
      return;
    }

    try {
      await updatePart({
        variables: {
          scene_id: sceneId,
          fingerprint_id: fingerprintId,
          part: partNum,
        },
      });

      await refetch();
    } catch (error) {
      alert("Failed to update part number. Please try again later.");
      console.error("Error updating fingerprint part:", error);
    }
  };

  const deleteModal = showDelete && (
    <Modal
      message={`Are you sure you want to delete ${deletionCandidates.length} fingerprints? This operation cannot be undone.`}
      callback={handleDelete}
    />
  );

  return (
    <>
      {deleteModal}
      <List
        page={page}
        setPage={setPage}
        perPage={perPage}
        listCount={data?.queryScenes.count}
        loading={loading}
        filters={filters}
        entityName="scenes"
      >
        <Row>
          <Table striped variant="dark">
            <thead>
              <tr>
                <th style={{ width: "50px" }}></th>
                <th>Title</th>
                <th>Code</th>
                <th>Studio</th>
                <th>Duration</th>
                <th style={{ width: "120px" }}>Release Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.queryScenes.scenes.map((scene) => (
                <UserSceneLine
                  key={scene.id}
                  scene={scene}
                  deleteFingerprints={deleteFingerprints}
                  changeFingerprintPart={(fingerprintId) =>
                    handlePartChange(scene.id, fingerprintId)
                  }
                />
              ))}
            </tbody>
          </Table>
        </Row>
      </List>
    </>
  );
};

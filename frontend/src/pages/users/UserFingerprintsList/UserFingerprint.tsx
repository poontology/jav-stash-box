import { FC } from "react";
import { Button } from "react-bootstrap";
import { FingerprintAlgorithm } from "src/graphql";
import { Icon } from "src/components/fragments";
import { formatDuration } from "src/utils";
import {
  faTimesCircle,
  faVideoCamera,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  fingerprint: {
    hash: string;
    duration: number;
    algorithm: FingerprintAlgorithm;
    part: number;
  };
  deleteFingerprint: () => void;
  changeFingerprintPart: () => void;
}

export const UserFingerprint: FC<Props> = ({
  fingerprint,
  deleteFingerprint,
  changeFingerprintPart,
}) => (
  <li>
    <div key={fingerprint.hash}>
      <Button
        className="text-danger ms-2"
        title="Submitted by you - click to remove submission"
        onClick={deleteFingerprint}
        variant="link"
      >
        <Icon icon={faTimesCircle} />
      </Button>
      <b className="me-2">{fingerprint.algorithm}</b>
      {fingerprint.hash} ({formatDuration(fingerprint.duration)})
      <Button
        className="text-danger ms-2"
        title="Submitted by you - click to change part"
        onClick={changeFingerprintPart}
        variant="link"
      >
        <Icon icon={faVideoCamera} />
      </Button>
      {fingerprint.part !== -1 && (
        <span className="ms-2">Part: {fingerprint.part}</span>
      )}
    </div>
  </li>
);

import { FC } from "react";
import { Button } from "react-bootstrap";
import { Icon } from "src/components/fragments";
import { faVideoCamera } from "@fortawesome/free-solid-svg-icons";
import { useUpdateFingerprintPart } from "src/graphql";

interface Props {
  sceneId: string;
  fingerprintId: number;
  currentPart: number | null;
  onPartChange?: () => void;
}

export const FingerprintPart: FC<Props> = ({
  sceneId,
  fingerprintId,
  currentPart,
  onPartChange,
}) => {
  const [updatePart] = useUpdateFingerprintPart();

  const handlePartChange = async (newPart?: number | null) => {
    let partNum = newPart;

    if (partNum === undefined) {
      const part = prompt("Part number");
      if (part === null) return;
      partNum = parseInt(part, 10);
      if (isNaN(partNum) || partNum < 1) {
        alert("Please enter a valid positive integer");
        return;
      }
    }

    try {
      await updatePart({
        variables: {
          scene_id: sceneId,
          fingerprint_id: fingerprintId,
          part: partNum || null,
        },
      });

      onPartChange?.();
    } catch (error) {
      alert(
        error instanceof Error
          ? "Error: " + error.message
          : "Failed to update part number. Please try again later.",
      );
      console.error("Error updating fingerprint part:", error);
    }
  };

  const handleClick = () => {
    if (currentPart === null) {
      handlePartChange();
    } else if (
      window.confirm("Are you sure you want to remove the part number?")
    ) {
      handlePartChange(null);
    }
  };

  return (
    <Button
      className={currentPart === null ? "text-success" : "text-danger"}
      title={currentPart === null ? "Set part number" : "Remove part number"}
      onClick={handleClick}
      variant="link"
    >
      <Icon icon={faVideoCamera} />
    </Button>
  );
};

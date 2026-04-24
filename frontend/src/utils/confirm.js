import Swal from "sweetalert2";

export const confirmAction = async (text = "Are you sure?") => {
  const result = await Swal.fire({
    title: "Confirm",
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  });

  return result.isConfirmed;
};
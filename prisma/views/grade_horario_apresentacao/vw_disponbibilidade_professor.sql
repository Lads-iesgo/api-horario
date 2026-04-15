SELECT
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `ds`.`idDiaSemana` AS `idDiaSemana`,
  `ds`.`diaSemana` AS `diaSemana`
FROM
  (
    (
      `grade_horario_apresentacao`.`professor` `p`
      JOIN `grade_horario_apresentacao`.`professor_disponibilidade` `pd` ON((`p`.`idProfessor` = `pd`.`idProfessor`))
    )
    JOIN `grade_horario_apresentacao`.`dia_semana` `ds` ON((`pd`.`idDiaSemana` = `ds`.`idDiaSemana`))
  )